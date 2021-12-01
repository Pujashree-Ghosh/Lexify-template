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

import css from './EditListingAreOfLawForm.module.css';

const EditListingAreOfLawFormComponent = props => (
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
        filterConfig,
        invalid,
        values,
        form,
      } = formRenderProps;
      console.log(values, values.areaOfLaw.length);

      const classes = classNames(rootClassName || css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = disabled || invalid || submitInProgress || pristine;

      const { updateListingError, showListingsError } = fetchErrors || {};
      const errorMessage = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingAreOfLawForm.updateFailed" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingAreOfLawForm.showListingFailed" />
        </p>
      ) : null;

      const options = findOptionsForSelectFilter('yogaStyles', filterConfig);
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
                    <FormattedMessage id="EditListingAreOfLawForm.title" />
                  </h3>
                  {fields.map((name, i) => {
                    return (
                      <div key={name}>
                        <div className={css.fromgroup}>
                          <FieldSelect
                            id={`${name}`}
                            name={`${name}`}
                            // label="Choose an option:"
                            validate={required}
                          >
                            <option value="">Contracts and Agreements</option>
                            <option value="first">First option</option>
                            <option value="second">Second option</option>
                          </FieldSelect>
                          <MdOutlineClose
                            onClick={() => {
                              // fields = fields.filter();
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
                  <div className={css.inlinefrom}>
                    <Button
                      className={css.addMore}
                      type="button"
                      onClick={() => {
                        fields.push();
                      }}
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

EditListingAreOfLawFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  fetchErrors: null,
  filterConfig: config.custom.filters,
};

EditListingAreOfLawFormComponent.propTypes = {
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
  filterConfig: propTypes.filterConfig,
};

const EditListingAreOfLawForm = EditListingAreOfLawFormComponent;

export default EditListingAreOfLawForm;
