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
import { TopbarContainer } from '../../containers';

import { updateProfile, uploadImage } from './ProfileSettingsPage.duck';
import css from './ProfileSettingsPage.module.css';

const onImageUploadHandler = (values, fn) => {
  const { id, imageId, file } = values;
  if (file) {
    fn({ id, imageId, file });
  }
};

export class ProfileSettingsPageComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: 'legalEntity',
    };
  }

  render() {
    const {
      currentUser,
      currentUserListing,
      image,
      onImageUpload,
      onUpdateProfile,
      scrollingDisabled,
      updateInProgress,
      updateProfileError,
      uploadImageError,
      uploadInProgress,
      intl,
    } = this.props;

    // console.log(this.state);
    // console.log(currentUser);
    const handleSubmit = values => {
      const { firstName, lastName, bio: rawBio } = values;

      // Ensure that the optional bio is a string
      const bio = rawBio || '';

      const profile = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio,
        // protectedData: {
        //   demo: 'asdf',
        // },
      };
      const uploadedImage = this.props.image;

      // Update profileImage only if file system has been accessed
      const updatedValues =
        uploadedImage && uploadedImage.imageId && uploadedImage.file
          ? { ...profile, profileImageId: uploadedImage.imageId }
          : profile;

      onUpdateProfile(updatedValues);
    };

    const user = ensureCurrentUser(currentUser);
    const { firstName, lastName, bio } = user.attributes.profile;
    const profileImageId = user.profileImage ? user.profileImage.id : null;
    const profileImage = image || { imageId: profileImageId };

    const profileSettingsForm = user.id ? (
      <ProfileSettingsForm
        className={css.form}
        currentUser={currentUser}
        initialValues={{ firstName, lastName, bio, profileImage: user.profileImage }}
        profileImage={profileImage}
        onImageUpload={e => onImageUploadHandler(e, onImageUpload)}
        uploadInProgress={uploadInProgress}
        updateInProgress={updateInProgress}
        uploadImageError={uploadImageError}
        updateProfileError={updateProfileError}
        onSubmit={handleSubmit}
        selectedOption={this.state.selectedOption}
      />
    ) : null;
    const cNamePlaceHolder = intl.formatMessage({
      id: 'ProfileSettingPage.cNamePlaceHolder',
    });
    // const cNamePlaceHolder = intl.formatMessage({
    //   id: 'ProfileSettingPage.cNamePlaceHolder',
    // });
    // const cNamePlaceHolder = intl.formatMessage({
    //   id: 'ProfileSettingPage.cNamePlaceHolder',
    // });
    // const cNamePlaceHolder = intl.formatMessage({
    //   id: 'ProfileSettingPage.cNamePlaceHolder',
    // });
    // const cNamePlaceHolder = intl.formatMessage({
    //   id: 'ProfileSettingPage.cNamePlaceHolder',
    // });
    // const cNamePlaceHolder = intl.formatMessage({
    //   id: 'ProfileSettingPage.cNamePlaceHolder',
    // });
    // const cNamePlaceHolder = intl.formatMessage({
    //   id: 'ProfileSettingPage.cNamePlaceHolder',
    // });
    // const cNamePlaceHolder = intl.formatMessage({
    //   id: 'ProfileSettingPage.cNamePlaceHolder',
    // });

    const userProfileType =
      user && !user?.attributes?.profile?.protectedData?.isLawyer ? (
        <div>
          <div className={css.radioButtons}>
            <label className={css.radio}>
              <input
                className={css.radioInput}
                name="userType"
                type="radio"
                value="legalEntity"
                checked={this.state.selectedOption === 'legalEntity'}
                onChange={() => {
                  this.setState({ selectedOption: 'legalEntity' });
                  console.log('clicked');
                }}
              />
              Legal entity
            </label>
            <label className={css.radio}>
              <input
                className={css.radioInput}
                name="userType"
                type="radio"
                value="privateIndividual"
                checked={this.state.selectedOption === 'privateIndividual'}
                onChange={() => {
                  this.setState({ selectedOption: 'privateIndividual' });
                  console.log('clicked....');
                }}
              />
              Private individual
            </label>
          </div>
          <div className={css.companyDetail}>
            <input type="text" placeholder={cNamePlaceHolder} />
            <input type="text" placeholder={cNamePlaceHolder} />
            <select name="cars" id="cars">
              <option value="volvo">Volvo</option>
              <option value="saab">Saab</option>
              <option value="mercedes">Mercedes</option>
              <option value="audi">Audi</option>
            </select>
            <input type="text" placeholder={cNamePlaceHolder} />
            <input type="text" placeholder={cNamePlaceHolder} />
            <input type="text" placeholder={cNamePlaceHolder} />
            <input type="text" placeholder={cNamePlaceHolder} />
            <select name="cars" id="cars">
              <option value="volvo">Volvo</option>
              <option value="saab">Saab</option>
              <option value="mercedes">Mercedes</option>
              <option value="audi">Audi</option>
            </select>
          </div>
        </div>
      ) : null;

    const title = intl.formatMessage({ id: 'ProfileSettingsPage.title' });

    return (
      <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutSingleColumn>
          <LayoutWrapperTopbar>
            <TopbarContainer currentPage="ProfileSettingsPage" />
            <UserNav selectedPageName="ProfileSettingsPage" listing={currentUserListing} />
          </LayoutWrapperTopbar>
          <LayoutWrapperMain>
            <div className={css.content}>
              {/* {userProfileType} */}
              <div className={css.headingContainer}>
                <h1 className={css.heading}>
                  <FormattedMessage id="ProfileSettingsPage.heading" />
                </h1>
                {user.id ? (
                  <NamedLink
                    className={css.profileLink}
                    name="ProfilePage"
                    params={{ id: user.id.uuid }}
                  >
                    <FormattedMessage id="ProfileSettingsPage.viewProfileLink" />
                  </NamedLink>
                ) : null}
              </div>
              {profileSettingsForm}
            </div>
          </LayoutWrapperMain>
          <LayoutWrapperFooter>
            <Footer />
          </LayoutWrapperFooter>
        </LayoutSingleColumn>
      </Page>
    );
  }
}

ProfileSettingsPageComponent.defaultProps = {
  currentUser: null,
  currentUserListing: null,
  uploadImageError: null,
  updateProfileError: null,
  image: null,
};

ProfileSettingsPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  currentUserListing: propTypes.ownListing,
  image: shape({
    id: string,
    imageId: propTypes.uuid,
    file: object,
    uploadedImage: propTypes.image,
  }),
  onImageUpload: func.isRequired,
  onUpdateProfile: func.isRequired,
  scrollingDisabled: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser, currentUserListing } = state.user;
  const {
    image,
    uploadImageError,
    uploadInProgress,
    updateInProgress,
    updateProfileError,
  } = state.ProfileSettingsPage;
  return {
    currentUser,
    currentUserListing,
    image,
    scrollingDisabled: isScrollingDisabled(state),
    updateInProgress,
    updateProfileError,
    uploadImageError,
    uploadInProgress,
  };
};

const mapDispatchToProps = dispatch => ({
  onImageUpload: data => dispatch(uploadImage(data)),
  onUpdateProfile: data => dispatch(updateProfile(data)),
});

const ProfileSettingsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(ProfileSettingsPageComponent);

export default ProfileSettingsPage;
