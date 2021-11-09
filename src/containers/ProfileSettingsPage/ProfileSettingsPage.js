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
    this.state = {};
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

    const user = ensureCurrentUser(currentUser);
    const { firstName, lastName, bio } = user.attributes.profile;
    const profileImageId = user.profileImage ? user.profileImage.id : null;
    const profileImage = image || { imageId: profileImageId };
    const protectedData = user?.attributes?.profile?.protectedData;
    const publicData = user?.attributes?.profile?.publicData;
    const isLawyer = protectedData?.isLawyer;
    const handleSubmit = values => {
      if (isLawyer === true) {
        const { firstName, lastName, bio: rawBio, schedule, profileImage, ...restVal } = values;

        const bio = rawBio || '';

        const profile = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          bio,
          protectedData: { schedule: schedule },
          publicData: restVal,
        };
        const uploadedImage = this.props.image;

        // Update profileImage only if file system has been accessed
        const updatedValues =
          uploadedImage && uploadedImage.imageId && uploadedImage.file
            ? { ...profile, profileImageId: uploadedImage.imageId }
            : profile;
        onUpdateProfile(updatedValues);
      }
      if (isLawyer === false) {
        const {
          firstName,
          lastName,
          bio: rawBio,
          profileImage,
          clientType,
          phoneNumber,
          vatNo,
          language,
          timeZone,
          schedule,
          ...restVal
        } = values;
        let publicData;
        if (clientType === 'privateIndividual') {
          const { companyName, companyNumber, ...rest } = restVal;
          publicData = {
            clientType: clientType,
            privateIndividual: rest,
            legalEntity: {},
            phoneNumber: phoneNumber,
            timeZone: timeZone,
            vatNo: vatNo,
            language: language,
          };
        } else {
          publicData = {
            clientType: clientType,
            privateIndividual: {},
            legalEntity: restVal,
            phoneNumber: phoneNumber,
            timeZone: timeZone,
            vatNo: vatNo,
            language: language,
          };
        }
        // console.log('after', Object.keys(values).forEach(k => values[k] == null && delete values[k]));

        // Ensure that the optional bio is a string
        const bio = rawBio || '';

        const profile = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          bio,
          protectedData: { schedule: schedule },
          publicData: publicData,
        };
        const uploadedImage = this.props.image;

        // Update profileImage only if file system has been accessed
        const updatedValues =
          uploadedImage && uploadedImage.imageId && uploadedImage.file
            ? { ...profile, profileImageId: uploadedImage.imageId }
            : profile;

        onUpdateProfile(updatedValues);
      }
    };

    // console.log(publicData.clientType);

    const profileSettingsForm =
      user.id && publicData && protectedData ? (
        protectedData.isLawyer ? (
          <ProfileSettingsForm
            className={css.form}
            currentUser={currentUser}
            initialValues={{
              firstName,
              lastName,
              bio,
              profileImage: user.profileImage,
              phoneNumber: publicData.phoneNumber,
              jurisdictionPractice: publicData.jurisdictionPractice
                ? publicData.jurisdictionPractice
                : [{}],
              language: publicData.language,
              timeZone: publicData.timeZone,
              education: publicData.education ? publicData.education : [{}],
              practice: publicData.practice ? publicData.practice : [{}],
              industry: publicData.industry ? publicData.industry : [{}],
              schedule: protectedData.schedule ? protectedData.schedule : [{}],
            }}
            profileImage={profileImage}
            onImageUpload={e => onImageUploadHandler(e, onImageUpload)}
            uploadInProgress={uploadInProgress}
            updateInProgress={updateInProgress}
            uploadImageError={uploadImageError}
            updateProfileError={updateProfileError}
            onSubmit={handleSubmit}
          />
        ) : (
          <ProfileSettingsForm
            className={css.form}
            currentUser={currentUser}
            initialValues={{
              firstName,
              lastName,
              bio,
              profileImage: user.profileImage,
              clientType: publicData.clientType,
              companyName:
                publicData.clientType === 'privateIndividual'
                  ? null
                  : publicData.legalEntity?.companyName,
              companyNumber:
                publicData.clientType === 'privateIndividual'
                  ? null
                  : publicData.legalEntity?.companyNumber,
              country:
                publicData.clientType === 'privateIndividual'
                  ? publicData.privateIndividual?.country
                  : publicData.legalEntity?.country,
              street:
                publicData.clientType === 'privateIndividual'
                  ? publicData.privateIndividual?.street
                  : publicData.legalEntity?.street,
              city:
                publicData.clientType === 'privateIndividual'
                  ? publicData.privateIndividual?.city
                  : publicData.legalEntity?.city,
              state:
                publicData.clientType === 'privateIndividual'
                  ? publicData.privateIndividual?.state
                  : publicData.legalEntity?.state,
              zipCode:
                publicData.clientType === 'privateIndividual'
                  ? publicData.privateIndividual?.zipCode
                  : publicData.legalEntity?.zipCode,
              phoneNumber: publicData.phoneNumber,
              vatNo: publicData.vatNo,
              language: publicData.language,
              timeZone: publicData.timeZone,
              schedule: protectedData.schedule ? protectedData.schedule : [{}],
            }}
            profileImage={profileImage}
            onImageUpload={e => onImageUploadHandler(e, onImageUpload)}
            uploadInProgress={uploadInProgress}
            updateInProgress={updateInProgress}
            uploadImageError={uploadImageError}
            updateProfileError={updateProfileError}
            onSubmit={handleSubmit}
          />
        )
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
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(ProfileSettingsPageComponent);

export default ProfileSettingsPage;
