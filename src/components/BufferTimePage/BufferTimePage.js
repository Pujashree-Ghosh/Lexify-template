import React, { Component } from 'react';
import { bool, func, object, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import { injectIntl, intlShape } from '../../util/reactIntl';
import {
  Page,
  UserNav,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
} from '../../components';
import { BufferTimeForm, ProfileSettingsForm } from '../../forms';
import { TopbarContainer } from '../../containers';
import ProfilePageSideNav from '../../components/ProfilePageSideNav/ProfilePageSideNav';
import { updateProfile } from '../../containers/ProfileSettingsPage/ProfileSettingsPage.duck';
import css from '../../containers/ProfileSettingsPage/ProfileSettingsPage.module.css';
import moment from 'moment';

export class BufferTimePageComponent extends Component {
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
      uploadImageError,
      uploadInProgress,
      intl,
    } = this.props;

    // console.log(this.state);
    // console.log(currentUser);

    const user = ensureCurrentUser(currentUser);
    const protectedData = user?.attributes?.profile?.protectedData;
    const uuid = user?.id?.uuid;
    // console.log(user.id.uuid);
    const isLawyer = protectedData?.isLawyer;
    const handleSubmit = values => {
      if (isLawyer === true) {
        const { beforeBufferTime, afterBufferTime } = values;

        const profile = {
          publicData: { beforeBufferTime, afterBufferTime },
        };

        // Update profileImage only if file system has been accessed
        const updatedValues = profile;
        onUpdateProfile(updatedValues, uuid);
      }
    };

    const beforeBufferTime = currentUser?.attributes?.profile?.publicData?.beforeBufferTime;
    const afterBufferTime = currentUser?.attributes?.profile?.publicData?.afterBufferTime;

    const profileSettingsForm = (
      <BufferTimeForm
        className={css.form}
        currentUser={currentUser}
        initialValues={{ beforeBufferTime, afterBufferTime }}
        uploadInProgress={uploadInProgress}
        updateInProgress={updateInProgress}
        updateProfileError={updateProfileError}
        onSubmit={handleSubmit}
      />
    );

    const title = intl.formatMessage({ id: 'ProfileSettingsPage.title' });

    return (
      <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutWrapperTopbar>
          <TopbarContainer currentPage="ProfileSettingsPage" />
          <UserNav selectedPageName="ProfileSettingsPage" listing={currentUserListing} />
        </LayoutWrapperTopbar>
        <div className={css.profrowup}>
          <ProfilePageSideNav currentTab="BufferTimePage" />
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

BufferTimePageComponent.defaultProps = {
  currentUser: null,
  currentUserListing: null,
  updateProfileError: null,
};

BufferTimePageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  currentUserListing: propTypes.ownListing,
  scrollingDisabled: bool.isRequired,
  onUpdateProfile: func.isRequired,
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
  onUpdateProfile: (data, uuid) => dispatch(updateProfile(data, uuid)),
});

const BufferTimePage = compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(BufferTimePageComponent);

export default BufferTimePage;
