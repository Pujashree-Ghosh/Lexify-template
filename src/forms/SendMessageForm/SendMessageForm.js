import React, { Component } from 'react';
import { string, bool, func } from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';
import { Form, FieldTextInput, SecondaryButton } from '../../components';
import { propTypes } from '../../util/types';

import { AiOutlineCloudUpload, AiOutlineCloseCircle } from 'react-icons/ai';
import { FiSend } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import { apiBaseUrl } from '../../util/api';
import Axios from 'axios';
import { BsPlusLg } from 'react-icons/bs';

import css from './SendMessageForm.module.css';

const BLUR_TIMEOUT_MS = 100;

const IconSendMessage = () => {
  return (
    <svg
      className={css.sendIcon}
      width="20"
      height="20"
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className={css.strokeMatter} fill="none" fillRule="evenodd" strokeLinejoin="round">
        <path d="M12.91 1L0 7.003l5.052 2.212z" />
        <path d="M10.75 11.686L5.042 9.222l7.928-8.198z" />
        <path d="M5.417 8.583v4.695l2.273-2.852" />
      </g>
    </svg>
  );
};

class SendMessageFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      fileUploadInProgress: false,
      fileUploadError: null,
      fileUploadProgress: 0,
      signedURL: null,
      fileUploadSuccess: null,
      cancelError: '',
    };
    this.fileInputRef = React.createRef();

    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.blurTimeoutId = null;
  }

  handleFocus() {
    this.props.onFocus();
    window.clearTimeout(this.blurTimeoutId);
  }

  handleBlur() {
    // We only trigger a blur if another focus event doesn't come
    // within a timeout. This enables keeping the focus synced when
    // focus is switched between the message area and the submit
    // button.
    this.blurTimeoutId = window.setTimeout(() => {
      this.props.onBlur();
    }, BLUR_TIMEOUT_MS);
  }
  setFileUploadError = msg => {
    this.setState(
      {
        fileUploadError: msg,
      },
      () =>
        setTimeout(() => {
          this.setState({
            fileUploadError: null,
          });
        }, 3000)
    );
  };

  onFileUpload = e => {
    let { name, size, type } = e.target.files.length ? e.target.files[0] : {};
    if (!name || !size || !type) {
      if (name) this.setFileUploadError('File format not supported');
      return;
    }
    let limit = 64;
    let maxSize = limit * 1024 * 1024; //64MB
    let fileName = name;
    // let fileName = name.split('.')[0] + '_' + new Date().getTime();
    const srcFile = e.target.files[0];

    if (size > maxSize) {
      this.setFileUploadError(`Max file size limit ${limit}mb`);
      return null;
    }

    Axios.post(`${apiBaseUrl()}/fileshare/getSignUrl`, {
      fileName: fileName,
      fileType: type,
    })
      .then(res => {
        this.setState({
          selectedFile: srcFile,
          signedURL: res.data,
        });
      })
      .catch(e => console.log(e));
  };

  sendFile = () => {
    this.setState({
      fileUploadInProgress: true,
    });
    Axios({
      method: 'put',
      url: this.state.signedURL,
      data: this.state.selectedFile,
      headers: { 'content-type': this.state.selectedFile.type },
      onUploadProgress: progressEvent => {
        let progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        this.setState({
          fileUploadProgress: progress,
        });
      },
    })
      .then(() => {
        this.setState({
          fileUploadInProgress: false,
          selectedFile: null,
          fileUploadSuccess: true,
        });

        let url = this.state.signedURL.split('?')[0];

        this.props.onSubmit({ message: url });

        setTimeout(() => {
          this.setState({
            fileUploadSuccess: null,
          });
        }, 3000);
      })
      .catch(e => {
        this.setFileUploadError('Someting went wrong, please try again.');
        this.setState({
          fileUploadInProgress: false,
          selectedFile: null,
        });
      });
  };

  render() {
    return (
      <FinalForm
        {...this.props}
        render={formRenderProps => {
          const {
            rootClassName,
            className,
            messagePlaceholder,
            handleSubmit,
            inProgress,
            sendMessageError,
            invalid,
            form,
            formId,
          } = formRenderProps;

          const classes = classNames(rootClassName || css.root, className);
          const submitInProgress = inProgress;
          const submitDisabled = invalid || submitInProgress;
          return (
            <Form className={classes} onSubmit={values => handleSubmit(values, form)}>
              <div className={css.msgContainer}>
                {this.state.selectedFile ? (
                  <div className={css.fileSelector}>
                    <div>{this.state.selectedFile.name}</div>
                  </div>
                ) : (
                  <FieldTextInput
                    inputRootClass={css.innertextarea}
                    className={css.textarea}
                    type="textarea"
                    id={formId ? `${formId}.message` : 'message'}
                    name="message"
                    placeholder={messagePlaceholder}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                  />
                )}

                {/* </div> */}
              </div>

              <div className={css.message}>
                {this.state.fileUploadSuccess ? (
                  <div className={css.successMessage}>File uploaded Successfully</div>
                ) : null}
                {this.state.fileUploadError ? (
                  <div className={css.failMessage}>{this.state.fileUploadError}</div>
                ) : null}
              </div>

              <div className={css.submitContainer}>
                <div className={css.errorContainer}>
                  {sendMessageError ? (
                    <p className={css.error}>
                      <FormattedMessage id="SendMessageForm.sendFailed" />
                    </p>
                  ) : null}
                </div>
              </div>
              <div className={css.icons}>
                <div className={css.upbtnrow}>
                  <div
                    className={css.uploadbtn}
                    onClick={() => {
                      this.fileInputRef.current.click();
                    }}
                  >
                    {this.state.selectedFile ? (
                      <span className={css.fileClearIcon}>
                        <IoMdClose
                          size={25}
                          className={css.discardIcon}
                          onClick={() =>
                            this.setState({
                              selectedFile: null,
                            })
                          }
                        />
                        <p>Click here to clear attachment...</p>
                      </span>
                    ) : (
                      <span>
                        <div>
                          <BsPlusLg size={25} className={css.uploadIcon} />
                          <p>Click here to add attachment...</p>
                        </div>
                      </span>
                    )}
                  </div>

                  <span
                    className={css.sendIconContainer}
                    onClick={
                      this.state.selectedFile
                        ? () => this.sendFile()
                        : values => handleSubmit(values, form)
                    }
                  >
                    <IconSendMessage />
                    <p>Send Message</p>
                  </span>

                  <input
                    style={{ display: 'none' }}
                    ref={this.fileInputRef}
                    type="file"
                    // accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document, .png, .jpg, .jpeg, .pdf, .xlsx"
                    onChange={this.onFileUpload}
                  />
                </div>

                {/* <SecondaryButton
                    rootClassName={css.submitButton}
                    inProgress={submitInProgress}
                    disabled={submitDisabled}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                  >
                    <IconSendMessage />
                    <FormattedMessage id="SendMessageForm.sendMessage" />
                  </SecondaryButton> */}
                <p className={css.frmttxt}>.PDF, .JPG, .GIF, or .PNG, Max. 10MB</p>
              </div>
            </Form>
          );
        }}
      />
    );
  }
}

SendMessageFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  inProgress: false,
  messagePlaceholder: null,
  onFocus: () => null,
  onBlur: () => null,
  sendMessageError: null,
};

SendMessageFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  inProgress: bool,

  messagePlaceholder: string,
  onSubmit: func.isRequired,
  onFocus: func,
  onBlur: func,
  sendMessageError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,
};

const SendMessageForm = compose(injectIntl)(SendMessageFormComponent);

SendMessageForm.displayName = 'SendMessageForm';

export default SendMessageForm;
