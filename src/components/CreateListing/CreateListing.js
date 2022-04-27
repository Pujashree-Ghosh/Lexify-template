import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { pathByRouteName } from '../../util/routes';
import routeConfiguration from '../../routeConfiguration';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  Page,
  UserNav,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
} from '../../components';
import { TopbarContainer } from '../../containers';

import css from './CreateListing.module.css';

function CreateListingPageComponent(props) {
  const { history, scrollingDisabled, intl } = props;
  const routes = routeConfiguration();
  const title = intl.formatMessage({ id: 'ProfileSettingsPage.title' });

  return (
    <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer currentPage="CreateListing" />
          <UserNav selectedPageName="CreateListing" />
        </LayoutWrapperTopbar>
        <LayoutWrapperMain>
          <div className={css.content}>
            <div className={css.headingContainer}>
              <h4>
                <FormattedMessage id="CreateListing.heading" />
                {/* <span>
                  <FormattedMessage id="CreateListing.subHeading" />
                </span> */}
              </h4>
            </div>

            <div className={css.typeContainer}>
              <div className={css.consultationrow}>
                <button
                  onClick={() => {
                    history.push(pathByRouteName('NewListingPublicOralPage', routes, {}));
                  }}
                >
                  <FormattedMessage id="CreateListing.publicOral" />
                </button>
                <div className={css.infoText}>
                  <FormattedMessage id="CreateListing.oralInfo" />
                </div>
              </div>
              <div className={css.consultationrow}>
                <button
                  onClick={() => {
                    history.push(pathByRouteName('NewListingCustomOralPage', routes, {}));
                  }}
                >
                  <FormattedMessage id="CreateListing.customOral" />
                </button>
                <div className={css.infoText}>
                  <FormattedMessage id="CreateListing.customInfo" />
                </div>
              </div>
              <div className={css.consultationrow}>
                <button
                  onClick={() => {
                    history.push(pathByRouteName('NewListingCustomServicePage', routes, {}));
                  }}
                >
                  <FormattedMessage id="CreateListing.customService" />
                </button>
                <div className={css.infoText}>
                  <FormattedMessage id="CreateListing.serviceInfo" />
                </div>
              </div>
            </div>
          </div>
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
  );
}
const mapStateToProps = state => {
  const { category } = state.user;
  return { scrollingDisabled: isScrollingDisabled(state) };
};
// const mapDispatchToProps = dispatch => ({
//   onSetListingCategory: category => dispatch(setListingCategory(category)),
// });
const CreateListing = compose(
  withRouter,
  connect(mapStateToProps)
)(injectIntl(CreateListingPageComponent));

export default CreateListing;
