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
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
  NamedLink,
  FieldRadioButton,
} from '../../components';
import { ProfileSettingsForm } from '../../forms';
import GeneralInfoForm from '../../forms/GeneralInfoForm/GeneralInfoForm';
import { TopbarContainer } from '../../containers';
import JurisdictionForm from '../../forms/JurisdictionForm/JurisdictionForm';
import ProfilePageSideNav from '../../components/ProfilePageSideNav/ProfilePageSideNav';
import {
  updateProfile,
  uploadImage,
} from '../../containers/ProfileSettingsPage/ProfileSettingsPage.duck';
import css from '../../containers/ProfileSettingsPage/ProfileSettingsPage.module.css';
import moment from 'moment';

const onImageUploadHandler = (values, fn) => {
  const { id, imageId, file } = values;
  if (file) {
    fn({ id, imageId, file });
  }
};

export class JurisdictionPageComponent extends Component {
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
    const initialjurisdictionPractice = publicData?.jurisdictionPractice?.map(m => {
      return { ...m, date: { date: moment(m.date).toDate() } };
    });
    const handleSubmit = values => {
      const jurisdictionPractice = values.jurisdictionPractice.map(m => {
        return { ...m, date: moment(m.date.date).format() };
      });
      if (isLawyer === true) {
        const profile = {
          publicData: { jurisdictionPractice },
        };

        // Update profileImage only if file system has been accessed
        const updatedValues = profile;
        onUpdateProfile(updatedValues, uuid);
      }
    };

    const profileSettingsForm = user.id && publicData && protectedData && protectedData.isLawyer && (
      <JurisdictionForm
        className={css.form}
        currentUser={currentUser}
        initialValues={{
          jurisdictionPractice: publicData.jurisdictionPractice
            ? initialjurisdictionPractice
            : [{}],
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
          <ProfilePageSideNav currentTab="JurisdictionPage" />
          <LayoutWrapperMain>
            <div className={css.content}>{profileSettingsForm}</div>
          </LayoutWrapperMain>
        </div>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </Page>
    );
  }
}

JurisdictionPageComponent.defaultProps = {
  currentUser: null,
  currentUserListing: null,
  uploadImageError: null,
  updateProfileError: null,
  image: null,
};

JurisdictionPageComponent.propTypes = {
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

const JurisdictionPage = compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(JurisdictionPageComponent);

export default JurisdictionPage;
