/**
 * This is the main server to run the production application.
 *
 * Running the server requires that `npm run build` is run so that the
 * production JS bundle can be imported.
 *
 * This server renders the requested URL in the server side for
 * performance, SEO, etc., and properly handles redirects, HTTP status
 * codes, and serving the static assets.
 *
 * When the application is loaded in a browser, the client side app
 * takes control and all the functionality such as routing is handled
 * in the client.
 */

// This enables nice stacktraces from the minified production bundle
require('source-map-support').install();

// Configure process.env with .env.* files
require('./env').configureEnv();

const http = require('http');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const enforceSsl = require('express-enforces-ssl');
const path = require('path');
const sharetribeSdk = require('sharetribe-flex-sdk');
const sitemap = require('express-sitemap');
const passport = require('passport');
const auth = require('./auth');
require('./globalHelpers');
const apiRouter = require('./apiRouter');
const wellKnownRouter = require('./wellKnownRouter');
const { getExtractors } = require('./importer');
const renderer = require('./renderer');
const dataLoader = require('./dataLoader');
const fs = require('fs');
const log = require('./log');
const { sitemapStructure } = require('./sitemap');
const csp = require('./csp');
const sdkUtils = require('./api-util/sdk');
const socketIo = require('socket.io');
const buildPath = path.resolve(__dirname, '..', 'build');
const env = process.env.REACT_APP_ENV;
const dev = process.env.REACT_APP_ENV === 'development';
const PORT = parseInt(process.env.PORT, 10);
const CLIENT_ID = process.env.REACT_APP_SHARETRIBE_SDK_CLIENT_ID;
const BASE_URL = process.env.REACT_APP_SHARETRIBE_SDK_BASE_URL;
const TRANSIT_VERBOSE = process.env.REACT_APP_SHARETRIBE_SDK_TRANSIT_VERBOSE === 'true';
const USING_SSL = process.env.REACT_APP_SHARETRIBE_USING_SSL === 'true';
const TRUST_PROXY = process.env.SERVER_SHARETRIBE_TRUST_PROXY || null;
const CSP = process.env.REACT_APP_CSP;
const cspReportUrl = '/csp-report';
const cspEnabled = CSP === 'block' || CSP === 'report';
const app = express();
const server = http.createServer(app);
const errorPage = fs.readFileSync(path.join(buildPath, '500.html'), 'utf-8');

// load sitemap and robots file structure
// and write those into files
sitemap(sitemapStructure()).toFile();

// Setup error logger
log.setup();
// Add logger request handler. In case Sentry is set up
// request information is added to error context when sent
// to Sentry.
app.use(log.requestHandler());

// The helmet middleware sets various HTTP headers to improve security.
// See: https://www.npmjs.com/package/helmet
// Helmet 4 doesn't disable CSP by default so we need to do that explicitly.
// If csp is enabled we will add that separately.

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

if (cspEnabled) {
  // When a CSP directive is violated, the browser posts a JSON body
  // to the defined report URL and we need to parse this body.
  app.use(
    bodyParser.json({
      type: ['json', 'application/csp-report'],
    })
  );

  // CSP can be turned on in report or block mode. In report mode, the
  // browser checks the policy and calls the report URL when the
  // policy is violated, but doesn't block any requests. In block
  // mode, the browser also blocks the requests.

  // In Helmet 4,supplying functions as directive values is not supported.
  // That's why we need to create own middleware function that calls the Helmet's middleware function
  const reportOnly = CSP === 'report';
  app.use((req, res, next) => {
    csp(cspReportUrl, USING_SSL, reportOnly)(req, res, next);
  });
}

// Redirect HTTP to HTTPS if USING_SSL is `true`.
// This also works behind reverse proxies (load balancers) as they are for example used by Heroku.
// In such cases, however, the TRUST_PROXY parameter has to be set (see below)
//
// Read more: https://github.com/aredo/express-enforces-ssl
//
if (USING_SSL) {
  app.use(enforceSsl());
}

// Set the TRUST_PROXY when running the app behind a reverse proxy.
//
// For example, when running the app in Heroku, set TRUST_PROXY to `true`.
//
// Read more: https://expressjs.com/en/guide/behind-proxies.html
//
if (TRUST_PROXY === 'true') {
  app.enable('trust proxy');
} else if (TRUST_PROXY === 'false') {
  app.disable('trust proxy');
} else if (TRUST_PROXY !== null) {
  app.set('trust proxy', TRUST_PROXY);
}

app.use(compression());
app.use('/static', express.static(path.join(buildPath, 'static')));
// server robots.txt from the root
app.use('/robots.txt', express.static(path.join(buildPath, 'robots.txt')));
app.use(cookieParser());

// These .well-known/* endpoints will be enabled if you are using FTW as OIDC proxy
// https://www.sharetribe.com/docs/cookbook-social-logins-and-sso/setup-open-id-connect-proxy/
// We need to handle these endpoints separately so that they are accessible by Flex
// even if you have enabled basic authentication e.g. in staging environment.
app.use('/.well-known', wellKnownRouter);

// Use basic authentication when not in dev mode. This is
// intentionally after the static middleware and /.well-known
// endpoints as those will bypass basic auth.
if (!dev) {
  const USERNAME = process.env.BASIC_AUTH_USERNAME;
  const PASSWORD = process.env.BASIC_AUTH_PASSWORD;
  const hasUsername = typeof USERNAME === 'string' && USERNAME.length > 0;
  const hasPassword = typeof PASSWORD === 'string' && PASSWORD.length > 0;

  // If BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD have been set - let's use them
  if (hasUsername && hasPassword) {
    app.use(auth.basicAuth(USERNAME, PASSWORD));
  }
}

//socket server side
var interval;
io.on('connection', socket => {
  console.log('New client connected', socket.handshake.query);
  const roomId = socket.handshake.query.roomId; //listingid-transectionid
  // const actualStartTime = socket.handshake.query.actualStartTime || false;
  const customerJoinTime = socket.handshake.query.customerJoinTime || false;
  const maxStartTime = socket.handshake.query.maxStartTime || false;
  // maxStartTime
  // customerJoinTime
  socket.join(roomId);
  // const clients = io.sockets.adapter.rooms.get('1');
  // console.log('clients', clients);
  const role = socket.handshake.query.role;
  connectedUsers[roomId] = connectedUsers[roomId] || {
    waitingRoom: [],
    meetingRoom: [],
    providerJoinedAt: null,
    customerJoinedAt: null,
    isCustomerJoinedAgain: false,
    isProviderJoinedAgain: false,
    isExtended: false,
    // actualStartTime,
    // customerJoinTime,
  };
  connectedUsers[roomId] = {
    ...connectedUsers[roomId],
    actualStartTime: connectedUsers[roomId].actualStartTime,
    customerJoinTime: connectedUsers[roomId].customerJoinTime || customerJoinTime,
    maxStartTime: connectedUsers[roomId].maxStartTime || maxStartTime,
  };
  if (role === 'customer') {
    if (!connectedUsers[roomId].customerJoinedAt) {
      connectedUsers[roomId].customerJoinedAt = Date.now();
    } else {
      connectedUsers[roomId].isCustomerJoinedAgain = true;
    }
    if (!connectedUsers[roomId].customerJoinTime) {
      connectedUsers[roomId].customerJoinTime = Date.now();
    }
  }
  if (role === 'provider') {
    if (!connectedUsers[roomId].providerJoinedAt) {
      connectedUsers[roomId].providerJoinedAt = Date.now();
    } else {
      connectedUsers[roomId].isProviderJoinedAgain = true;
    }
  }
  connectedUsers[roomId].waitingRoom = [role, ...(connectedUsers[roomId].waitingRoom || [])];
  console.log(connectedUsers[roomId], role);
  if (role === 'customer' || connectedUsers[roomId].waitingRoom.includes('customer')) {
    io.in(roomId).emit('customer-connected', connectedUsers[roomId]);
    // socket.to(roomId).broadcast.emit('customer connected');
  }
  if (role === 'provider' || connectedUsers[roomId].waitingRoom.includes('provider')) {
    // socket.to(roomId).broadcast.emit('provider connected');
    console.log(180);
    io.in(roomId).emit('provider-connected', connectedUsers[roomId]);
  }
  if (
    connectedUsers[roomId].meetingRoom &&
    connectedUsers[roomId].meetingRoom.includes('provider')
  ) {
    io.in(roomId).emit('meeting', {
      status: 'open',
      isProvider: true,
      actualStartTime: connectedUsers[roomId].actualStartTime,
      customerJoinTime: connectedUsers[roomId].customerJoinTime,
    });
  }
  if (
    connectedUsers[roomId].meetingRoom &&
    connectedUsers[roomId].meetingRoom.includes('customer')
  ) {
    io.in(roomId).emit('meeting', {
      status: 'open',
      isProvider: false,
      actualStartTime: connectedUsers[roomId].actualStartTime,
      customerJoinTime: connectedUsers[roomId].customerJoinTime,
    });
  }

  if (interval) {
    clearInterval(interval);
  }

  interval = setInterval(() => getApiAndEmit(socket), 1000);

  socket.on('meeting-server', data => {
    console.log('meeting-server', data);
    if (data.status === 'close') {
      connectedUsers[roomId].meetingRoom = connectedUsers[roomId].meetingRoom || [];
      console.log(connectedUsers[roomId]);
      const revIndex = connectedUsers[roomId].meetingRoom.findIndex(item => item === role);
      console.log('revIndex', revIndex);
      if (revIndex !== -1) {
        let oldUsers = connectedUsers[roomId].meetingRoom;
        oldUsers.splice(revIndex, 1);
        connectedUsers[roomId].meetingRoom = oldUsers;
        console.log(connectedUsers[roomId]);
      }
    } else if (data.status === 'open') {
      console.log(258, connectedUsers[roomId.actualStartTime]);
      if (!connectedUsers[roomId].actualStartTime && data.isProvider) {
        console.log(260);
        connectedUsers[roomId].actualStartTime = Math.min(
          new Date().getTime(),
          connectedUsers[roomId].maxStartTime
        );
      }
      connectedUsers[roomId] = connectedUsers[roomId] || {};
      connectedUsers[roomId].meetingRoom = [role, ...(connectedUsers[roomId].meetingRoom || [])];
    }

    data.actualStartTime = connectedUsers[roomId].actualStartTime;
    console.log(data);
    io.in(roomId).emit('meeting', data);
  });

  socket.on('meeting-message', data => {
    io.in(roomId).emit('meeting-message', data);
  });

  socket.on('meeting-time-extend', time => {
    connectedUsers[roomId].actualStartTime = moment(connectedUsers[roomId].actualStartTime).add(
      5,
      'm'
    );
    connectedUsers[roomId].isExtended = true;

    io.in(roomId).emit('meeting-time-extend', time);
  });
  socket.on('disconnect', () => {
    connectedUsers[roomId].waitingRoom = connectedUsers[roomId].waitingRoom || [];
    console.log(connectedUsers[roomId]);
    let revIndex = connectedUsers[roomId].waitingRoom.findIndex(item => item === role);
    console.log('revIndex', revIndex);
    if (revIndex !== -1) {
      let oldUsers = connectedUsers[roomId].waitingRoom;
      oldUsers.splice(revIndex, 1);
      connectedUsers[roomId].waitingRoom = oldUsers;
      console.log(connectedUsers[roomId]);
    }
    connectedUsers[roomId].meetingRoom = connectedUsers[roomId].meetingRoom || [];
    console.log(connectedUsers[roomId]);
    revIndex = connectedUsers[roomId].meetingRoom.findIndex(item => item === role);
    console.log('revIndex', revIndex);
    if (revIndex !== -1) {
      let oldUsers = connectedUsers[roomId].meetingRoom;
      oldUsers.splice(revIndex, 1);
      connectedUsers[roomId].meetingRoom = oldUsers;
      console.log(connectedUsers[roomId]);
    }
    if (role === 'customer') {
      io.in(roomId).emit('customer-disconnected');
    }
    if (role === 'provider') {
      io.in(roomId).emit('provider-disconnected');
    }
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

const getApiAndEmit = socket => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit('FromAPI', response);
};

// Initialize Passport.js  (http://www.passportjs.org/)
// Passport is authentication middleware for Node.js
// We use passport to enable authenticating with
// a 3rd party identity provider (e.g. Facebook or Google)
app.use(passport.initialize());

// Server-side routes that do not render the application
app.use('/api', apiRouter);

const noCacheHeaders = {
  'Cache-control': 'no-cache, no-store, must-revalidate',
};

// Instantiate HTTP(S) Agents with keepAlive set to true.
// This will reduce the request time for consecutive requests by
// reusing the existing TCP connection, thus eliminating the time used
// for setting up new TCP connections.
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

app.get('*', (req, res) => {
  if (req.url.startsWith('/static/')) {
    // The express.static middleware only handles static resources
    // that it finds, otherwise passes them through. However, we don't
    // want to render the app for missing static resources and can
    // just return 404 right away.
    return res.status(404).send('Static asset not found.');
  }

  if (req.url === '/_status.json') {
    return res.status(200).send({ status: 'ok' });
  }

  const context = {};

  // Get handle to tokenStore
  // We check in unauthorized cases if requests have set tokens to cookies
  const tokenStore = sharetribeSdk.tokenStore.expressCookieStore({
    clientId: CLIENT_ID,
    req,
    res,
    secure: USING_SSL,
  });

  const baseUrl = BASE_URL ? { baseUrl: BASE_URL } : {};

  const sdk = sharetribeSdk.createInstance({
    transitVerbose: TRANSIT_VERBOSE,
    clientId: CLIENT_ID,
    httpAgent: httpAgent,
    httpsAgent: httpsAgent,
    tokenStore,
    typeHandlers: sdkUtils.typeHandlers,
    ...baseUrl,
  });

  // Until we have a better plan for caching dynamic content and we
  // make sure that no sensitive data can appear in the prefetched
  // data, let's disable response caching altogether.
  res.set(noCacheHeaders);

  // Get chunk extractors from node and web builds
  // https://loadable-components.com/docs/api-loadable-server/#chunkextractor
  const { nodeExtractor, webExtractor } = getExtractors();

  // Server-side entrypoint provides us the functions for server-side data loading and rendering
  const nodeEntrypoint = nodeExtractor.requireEntrypoint();
  const { default: renderApp, matchPathname, configureStore, routeConfiguration } = nodeEntrypoint;

  dataLoader
    .loadData(req.url, sdk, matchPathname, configureStore, routeConfiguration)
    .then(preloadedState => {
      const html = renderer.render(req.url, context, preloadedState, renderApp, webExtractor);

      if (dev) {
        const debugData = {
          url: req.url,
          context,
        };
        console.log(`\nRender info:\n${JSON.stringify(debugData, null, '  ')}`);
      }

      if (context.unauthorized) {
        // Routes component injects the context.unauthorized when the
        // user isn't logged in to view the page that requires
        // authentication.
        sdk.authInfo().then(authInfo => {
          if (authInfo && authInfo.isAnonymous === false) {
            // It looks like the user is logged in.
            // Full verification would require actual call to API
            // to refresh the access token
            res.status(200).send(html);
          } else {
            // Current token is anonymous.
            res.status(401).send(html);
          }
        });
      } else if (context.forbidden) {
        res.status(403).send(html);
      } else if (context.url) {
        // React Router injects the context.url if a redirect was rendered
        res.redirect(context.url);
      } else if (context.notfound) {
        // NotFoundPage component injects the context.notfound when a
        // 404 should be returned
        res.status(404).send(html);
      } else {
        res.send(html);
      }
    })
    .catch(e => {
      log.error(e, 'server-side-render-failed');
      res.status(500).send(errorPage);
    });
});

// Set error handler. If Sentry is set up, all error responses
// will be logged there.
app.use(log.errorHandler());

if (cspEnabled) {
  // Dig out the value of the given CSP report key from the request body.
  const reportValue = (req, key) => {
    const report = req.body ? req.body['csp-report'] : null;
    return report && report[key] ? report[key] : key;
  };

  // Handler for CSP violation reports.
  app.post(cspReportUrl, (req, res) => {
    const effectiveDirective = reportValue(req, 'effective-directive');
    const blockedUri = reportValue(req, 'blocked-uri');
    const msg = `CSP: ${effectiveDirective} doesn't allow ${blockedUri}`;
    log.error(new Error(msg), 'csp-violation');
    res.status(204).end();
  });
}

server.listen(PORT, () => {
  const mode = dev ? 'development' : 'production';
  console.log(`Listening to port ${PORT} in ${mode} mode`);
  if (dev) {
    console.log(`Open http://localhost:${PORT}/ and start hacking!`);
  }
});
