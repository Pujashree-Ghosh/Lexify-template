import React, { Component } from 'react';
import { bool, func, object, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  Page,
  UserNav,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
} from '../../components';
import PracticeAreaForm from '../../forms/PracticeAreaForm/PracticeAreaForm';
import { TopbarContainer } from '../../containers';
import ProfilePageSideNav from '../../components/ProfilePageSideNav/ProfilePageSideNav';

import { updateProfile } from '../../containers/ProfileSettingsPage/ProfileSettingsPage.duck';
import css from '../../containers/ProfileSettingsPage/ProfileSettingsPage.module.css';
import moment from 'moment';

export class PracticeAreaPageComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      currentUser,
      currentUserListing,
      onUpdateProfile,
      scrollingDisabled,
      updateInProgress,
      updateProfileError,
      intl,
    } = this.props;
    // console.log(this.state);
    // console.log(currentUser);

    const user = ensureCurrentUser(currentUser);
    const protectedData = user?.attributes?.profile?.protectedData;
    const publicData = user?.attributes?.profile?.publicData;
    const uuid = user?.id?.uuid;
    // console.log(user.id.uuid);
    const isLawyer = protectedData?.isLawyer;
    const initialIndustry = publicData?.industry?.map(m => {
      return { ...m, from: { date: moment(m.from).toDate() }, to: { date: moment(m.to).toDate() } };
    });
    const handleSubmit = values => {
      const industry = values.industry.map(m => {
        return { ...m, from: moment(m.from.date).format(), to: moment(m.to.date).format() };
      });
      const practice = values.practice;
      if (isLawyer === true) {
        const profile = {
          publicData: { practice, industry },
        };

        // Update profileImage only if file system has been accessed
        const updatedValues = profile;
        onUpdateProfile(updatedValues, uuid);
      }
    };

    const profileSettingsForm = user.id && publicData && protectedData && protectedData.isLawyer && (
      <PracticeAreaForm
        className={css.form}
        currentUser={currentUser}
        initialValues={{
          practice: publicData.practice ? publicData.practice : [{}],
          industry: publicData.industry ? initialIndustry : [{}],
        }}
        updateInProgress={updateInProgress}
        updateProfileError={updateProfileError}
        onSubmit={handleSubmit}
      />
    );

    const title = intl.formatMessage({ id: 'ProfileSettingsPage.title' });

    return (
      <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
        {/* <LayoutSingleColumn> */}
        <LayoutWrapperTopbar>
          <TopbarContainer currentPage="ProfileSettingsPage" />
          <UserNav selectedPageName="ProfileSettingsPage" listing={currentUserListing} />
        </LayoutWrapperTopbar>

        <div className={css.profrowup}>
          <ProfilePageSideNav currentTab="PracticeAreaPage" />
          <LayoutWrapperMain>
            <div className={css.content}>{profileSettingsForm}</div>
          </LayoutWrapperMain>
        </div>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
        {/* </LayoutSingleColumn> */}
      </Page>
    );
  }
}

PracticeAreaPageComponent.defaultProps = {
  currentUser: null,
  currentUserListing: null,
  uploadImageError: null,
  updateProfileError: null,
  image: null,
};

PracticeAreaPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  currentUserListing: propTypes.ownListing,
  onUpdateProfile: func.isRequired,
  scrollingDisabled: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser, currentUserListing } = state.user;
  const { updateInProgress, updateProfileError } = state.ProfileSettingsPage;
  return {
    currentUser,
    currentUserListing,
    scrollingDisabled: isScrollingDisabled(state),
    updateInProgress,
    updateProfileError,
  };
};

const mapDispatchToProps = dispatch => ({
  onImageUpload: data => dispatch(uploadImage(data)),
  onUpdateProfile: (data, uuid) => dispatch(updateProfile(data, uuid)),
});

const PracticeAreaPage = compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(PracticeAreaPageComponent);

export default PracticeAreaPage;
