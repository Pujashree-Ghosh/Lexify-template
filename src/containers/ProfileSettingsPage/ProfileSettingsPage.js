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
      companyName: '',
      companyNumber: '',
      country: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isLawyer: '',
    };
  }
  componentDidMount() {
    const user = ensureCurrentUser(this.props.currentUser);
    const protectedData = user?.attributes?.profile?.protectedData;
    const { clientType, isLawyer } = protectedData ? protectedData : '';
    // console.log(isLawyer);
    this.setState({ isLawyer: isLawyer });
    if (clientType === 'legalEntity') {
      this.setState({
        companyName: protectedData.legalEntity.companyName,
        companyNumber: protectedData.legalEntity.companyNumber,
        country: protectedData.legalEntity.country,
        street: protectedData.legalEntity.street,
        city: protectedData.legalEntity.city,
        state: protectedData.legalEntity.state,
        zipCode: protectedData.legalEntity.zipCode,
      });
    }
    if (clientType === 'privateIndividual') {
      this.setState({
        companyName: null,
        companyNumber: null,
        country: protectedData.privateIndividual.country,
        street: protectedData.privateIndividual.street,
        city: protectedData.privateIndividual.city,
        state: protectedData.privateIndividual.state,
        zipCode: protectedData.privateIndividual.zipCode,
      });
    }
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
      if (this.state.isLawyer) {
        const { firstName, lastName, bio: rawBio, ...restVal } = values;

        const bio = rawBio || '';

        const profile = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          bio,
          protectedData: restVal,
        };
        const uploadedImage = this.props.image;

        // Update profileImage only if file system has been accessed
        const updatedValues =
          uploadedImage && uploadedImage.imageId && uploadedImage.file
            ? { ...profile, profileImageId: uploadedImage.imageId }
            : profile;

        onUpdateProfile(updatedValues);
      } else {
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
        let protectedData;
        if (clientType === 'privateIndividual') {
          const { companyName, companyNumber, ...rest } = restVal;
          protectedData = {
            clientType: clientType,
            privateIndividual: rest,
            legalEntity: {},
            phoneNumber: phoneNumber,
            timeZone: timeZone,
            vatNo: vatNo,
            language: language,
            schedule: schedule,
          };
        } else {
          protectedData = {
            clientType: clientType,
            privateIndividual: {},
            legalEntity: restVal,
            phoneNumber: phoneNumber,
            timeZone: timeZone,
            vatNo: vatNo,
            language: language,
            schedule: schedule,
          };
        }
        // console.log('after', Object.keys(values).forEach(k => values[k] == null && delete values[k]));

        // Ensure that the optional bio is a string
        const bio = rawBio || '';

        const profile = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          bio,
          protectedData: protectedData,
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

    const user = ensureCurrentUser(currentUser);
    const { firstName, lastName, bio } = user.attributes.profile;
    const profileImageId = user.profileImage ? user.profileImage.id : null;
    const profileImage = image || { imageId: profileImageId };
    const protectedData = user?.attributes?.profile?.protectedData;

    const profileSettingsForm = user.id ? (
      protectedData.isLawyer ? (
        <ProfileSettingsForm
          className={css.form}
          currentUser={currentUser}
          initialValues={{
            firstName,
            lastName,
            bio,
            profileImage: user.profileImage,
            phoneNumber: protectedData?.phoneNumber,
            jurisdictionPractice: protectedData?.jurisdictionPractice
              ? protectedData.jurisdictionPractice
              : [{}],
            language: protectedData?.language,
            timeZone: protectedData?.timeZone,
            education: protectedData?.education ? protectedData.education : [{}],
            practice: protectedData?.practice ? protectedData.practice : [{}],
            industry: protectedData?.industry ? protectedData.industry : [{}],
            schedule: protectedData?.schedule ? protectedData.schedule : [{}],
          }}
          profileImage={profileImage}
          onImageUpload={e => onImageUploadHandler(e, onImageUpload)}
          uploadInProgress={uploadInProgress}
          updateInProgress={updateInProgress}
          uploadImageError={uploadImageError}
          updateProfileError={updateProfileError}
          onSubmit={handleSubmit}
          selectedOption={this.state.selectedOption}
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
            clientType: 'privateIndividual',
            companyName: this.state.companyName,
            companyNumber: this.state.companyNumber,
            country: this.state.country,
            street: this.state.street,
            city: this.state.city,
            state: this.state.state,
            zipCode: this.state.zipCode,
            phoneNumber: protectedData?.phoneNumber,
            vatNo: protectedData?.vatNo,
            language: protectedData?.language,
            timeZone: protectedData?.timeZone,
            schedule: protectedData?.schedule ? protectedData.schedule : [{}],
          }}
          profileImage={profileImage}
          onImageUpload={e => onImageUploadHandler(e, onImageUpload)}
          uploadInProgress={uploadInProgress}
          updateInProgress={updateInProgress}
          uploadImageError={uploadImageError}
          updateProfileError={updateProfileError}
          onSubmit={handleSubmit}
          selectedOption={this.state.selectedOption}
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
