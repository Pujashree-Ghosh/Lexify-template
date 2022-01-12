import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FormattedMessage } from '../../util/reactIntl';
import { findOptionsForSelectFilter } from '../../util/search';
import { propTypes } from '../../util/types';
import config from '../../config';
import { Button, FieldCheckboxGroup, FieldSelect, Form } from '../../components';
import { FieldArray } from 'react-final-form-arrays';
import * as validators from '../../util/validators';
import { MdOutlineClose } from 'react-icons/md';

import css from './EditListingAreaOfLawForm.module.css';
import cloneDeep from 'lodash.clonedeep';

const EditListingAreaOfLawFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        disabled,
        ready,
        rootClassName,
        className,
        handleSubmit,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        areaOfLawOptions,
        invalid,
        values,
        form,
      } = formRenderProps;
      // console.log(values, values.areaOfLaw.length);
      // console.log(123, areaOfLawOptions);

      const classes = classNames(rootClassName || css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = disabled || invalid || submitInProgress;

      const { updateListingError, showListingsError } = fetchErrors || {};
      const errorMessage = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingAreaOfLawForm.updateFailed" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingAreaOfLawForm.showListingFailed" />
        </p>
      ) : null;

      // const options = findOptionsForSelectFilter('yogaStyles', filterConfig);
      const required = validators.required('This field is required');

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessage}
          {errorMessageShowListing}
          <FieldArray name="areaOfLaw">
            {({ fields }) => {
              return (
                <div className={css.sectionContainer}>
                  <h3 className={css.sectionTitle}>
                    <FormattedMessage id="EditListingAreaOfLawForm.title" />
                  </h3>
                  {fields.map((name, i) => {
                    const options = cloneDeep(areaOfLawOptions).filter(
                      ({ key }) => !values.areaOfLaw.filter((m, index) => index !== i).includes(key)
                    );

                    // console.log(
                    //   areaOfLawOptions.map(({ key }) => key),
                    //   values.areaOfLaw,
                    //   i
                    // );

                    return (
                      <div key={name}>
                        <div className={css.fromgroup}>
                          <FieldSelect
                            id={`${name}`}
                            name={`${name}`}
                            validate={required}
                            className={css.fgselect}
                          >
                            <option value="">Choose an option</option>
                            {cloneDeep(options).map(m => (
                              <option value={m.key}>{m.label}</option>
                            ))}
                          </FieldSelect>
                          <MdOutlineClose
                            onClick={() => {
                              form.change(
                                'areaOfLaw',
                                values.areaOfLaw.filter(f => f !== values.areaOfLaw[i])
                              );
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className={css.inlineaddbtn}>
                    <Button
                      className={css.addMore}
                      type="button"
                      onClick={() => {
                        fields.push();
                      }}
                      disabled={!values?.areaOfLaw[values?.areaOfLaw?.length - 1]}
                    >
                      <FormattedMessage id="EditlistingAreaOfLawForm.addMore" />
                    </Button>
                    {/* <Button
                      className={css.remove}
                      type="button"
                      onClick={() => {
                        fields.pop();
                      }}
                      //   disabled={values.industry?.length < 2}
                    >
                      <FormattedMessage id="ProfileSettingsForm.remove" />
                    </Button> */}
                  </div>
                </div>
              );
            }}
          </FieldArray>

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled || values?.areaOfLaw?.length === 0}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

EditListingAreaOfLawFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  fetchErrors: null,
  areaOfLawOptions: config.custom.areaOfLaw.options,
};

EditListingAreaOfLawFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  areaOfLawOptions: propTypes.areaOfLawOptions,
};

const EditListingAreaOfLawForm = EditListingAreaOfLawFormComponent;

export default EditListingAreaOfLawForm;
