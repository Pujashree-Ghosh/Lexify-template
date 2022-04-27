import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import routeConfiguration from '../../routeConfiguration';
import { createResourceLocatorString } from '../../util/routes';
import { injectIntl, intlShape } from '../../util/reactIntl';
import {
  Page,
  UserNav,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
} from '../../components';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import { array, bool, func, oneOf, object, shape, string } from 'prop-types';
import { propTypes } from '../../util/types';
import css from './PromotionPage.module.css';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import moment from 'moment';

function PromotionBasePageComponent(props) {
  const { history, intl, currentUser, scrollingDisabled } = props;
  const title = intl.formatMessage({ id: 'PromotionBasePage.title' });

  useEffect(() => {
    const email = currentUser?.attributes?.email;
    if (email) {
      history.push(
        createResourceLocatorString(
          'PromotionPage',
          routeConfiguration(),
          { tab: 'One_N_One' },
          { pub_clientId: `${email}`, pub_expiry: `${moment().valueOf()},` }
        )
      );
      //   return () => {
      //     // clearTimeout(timer);
      //   };
    }
  }, [currentUser]);
  return (
    <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer
            className={css.topbar}
            mobileRootClassName={css.mobileTopbar}
            desktopClassName={css.desktopTopbar}
            currentPage="PromotionPage"
          />
          <UserNav selectedPageName="PromotionPage" />
        </LayoutWrapperTopbar>
        <LayoutWrapperMain>
          <div>Loading Result..</div>
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
  );
}

PromotionBasePageComponent.defaultProps = {
  currentUser: {},
};

PromotionBasePageComponent.propTypes = {
  currentUser: object,
  scrollingDisabled: bool.isRequired,

  history: shape({
    push: func.isRequired,
  }).isRequired,

  intl: intlShape.isRequired,
};
const mapStateToProps = state => {
  const { currentUser } = state.user;

  return {
    currentUser,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const PromotionBasePage = compose(
  withRouter,
  connect(mapStateToProps),
  injectIntl
)(PromotionBasePageComponent);

export default PromotionBasePage;
