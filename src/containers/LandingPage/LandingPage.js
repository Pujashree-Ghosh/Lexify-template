import React from 'react';
import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { injectIntl, intlShape } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import { propTypes } from '../../util/types';
import config from '../../config';
// import { Field, Form as FinalForm } from 'react-final-form';
import {
  Form,
  Button,
  FieldTextInput,
  FieldSelect,
  FieldDateInput,
  Page,
  SectionHero,
  SectionHowItWorks,
  SectionLocations,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
} from '../../components';
import SearchPage from '../../containers/SearchPage/SearchPage';

import { TopbarContainer } from '../../containers';

import facebookImage from '../../assets/yogatimeFacebook-1200x630.jpg';
import twitterImage from '../../assets/yogatimeTwitter-600x314.jpg';
import css from './LandingPage.module.css';

import searchiconbtn from '../../assets/Icon-awesome-search.svg';

export const LandingPageComponent = props => {
  const {
    history,
    intl,
    location,
    scrollingDisabled,
    currentUserListing,
    currentUserListingFetched,
  } = props;

  // Schema for search engines (helps them to understand what this page is about)
  // http://schema.org
  // We are using JSON-LD format
  const siteTitle = config.siteTitle;
  const schemaTitle = intl.formatMessage({ id: 'LandingPage.schemaTitle' }, { siteTitle });
  const schemaDescription = intl.formatMessage({ id: 'LandingPage.schemaDescription' });
  const schemaImage = `${config.canonicalRootURL}${facebookImage}`;

  return (
    <Page
      className={css.root}
      scrollingDisabled={scrollingDisabled}
      contentType="website"
      description={schemaDescription}
      title={schemaTitle}
      facebookImages={[{ url: facebookImage, width: 1200, height: 630 }]}
      twitterImages={[
        { url: `${config.canonicalRootURL}${twitterImage}`, width: 600, height: 314 },
      ]}
      schema={{
        '@context': 'http://schema.org',
        '@type': 'WebPage',
        description: schemaDescription,
        name: schemaTitle,
        image: [schemaImage],
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>
        <LayoutWrapperMain>
          <div className={css.sectionContent}>
            <div className={css.updthmform}>
              <h2>Find Legal Advice Online</h2>
              <p>Find experienced lawyers you need. Anytime. Anywhere.</p>

              <div className={css.lformrow}>
                <div className={css.lformcol}>
                  <label>Country</label>
                  <select className={css.formcontrol}>
                    <option selected>Select Country</option>
                    <option>adasd</option>
                    <option>adasd</option>
                  </select>
                  {/* <FieldTextInput className={css.firstName} type="text" />
                  <FieldSelect
                    // id="timeZone"
                    name="timeZone"
                  >
                    <option value="">aa</option>
                    <option value="first">bbb</option>
                    <option value="second">ccc</option>
                  </FieldSelect> */}
                </div>

                <div className={css.lformcol}>
                  <label>City</label>
                  <input type="text" className={css.formcontrol} placeholder="Enter City Name" />
                </div>

                {/* <div className={css.lformcol}>
                  <label>State</label>
                  <select className={css.formcontrol}>
                    <option selected>Select State</option>
                    <option>adasd</option>
                    <option>adasd</option>
                  </select>
                </div>

                <div className={css.lformcol}>
                  <label>ZIP</label>
                  <input type="text" className={css.formcontrol} placeholder="Type ZIP Code" />
                </div> */}

                <div className={css.lformcol}>
                  <label>Practice Area</label>
                  <select className={css.formcontrol}>
                    <option selected>Select Practice Area</option>
                    <option>adasd</option>
                    <option>adasd</option>
                  </select>
                </div>
              </div>
              <div className={css.lformrow}>
                <div className={css.lformcol}>
                  <label>Keyword</label>
                  <input type="text" className={css.formcontrol} placeholder="Type Keyword" />
                </div>

                <div className={css.lformcol}>
                  <label>Language</label>
                  <select className={css.formcontrol}>
                    <option selected>Select Language</option>
                    <option>adasd</option>
                    <option>adasd</option>
                  </select>
                </div>

                <div className={css.lformcol}>
                  <label>Industry</label>
                  <select className={css.formcontrol}>
                    <option selected>Select Industry</option>
                    <option>adasd</option>
                    <option>adasd</option>
                  </select>
                </div>
              </div>
              <Button className={css.submitButton} type="submit" onClick={() => {}}>
                <img src={searchiconbtn} /> Find Legal Advice
              </Button>

              <p className={css.aylbtntxt}>
                Are you a lawyer?
                <Link to="/">Join us now!</Link>
              </p>
            </div>
          </div>
          {/* <div className={css.heroContainer}>
            <SectionHero className={css.hero} history={history} location={location} />
          </div> */}
          {/* <ul className={css.sections}>
            <li className={css.section}>
              <div className={css.sectionContentFirstChild}>
                <SectionLocations />
              </div>
            </li>
            <li className={css.section}>
              <div className={css.sectionContent}>
                <SectionHowItWorks
                  currentUserListing={currentUserListing}
                  currentUserListingFetched={currentUserListingFetched}
                />
              </div>
            </li>
          </ul> */}
          {/* <SearchPage /> */}
        </LayoutWrapperMain>

        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
  );
};

LandingPageComponent.defaultProps = {
  currentUserListing: null,
  currentUserListingFetched: false,
};

LandingPageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  currentUserListing: propTypes.ownListing,
  currentUserListingFetched: bool,

  // from withRouter
  history: object.isRequired,
  location: object.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUserListing, currentUserListingFetched } = state.user;

  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUserListing,
    currentUserListingFetched,
  };
};

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const LandingPage = compose(withRouter, connect(mapStateToProps), injectIntl)(LandingPageComponent);

export default LandingPage;
