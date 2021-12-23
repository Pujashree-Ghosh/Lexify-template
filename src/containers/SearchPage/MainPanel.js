import React, { Component } from 'react';
import { array, bool, func, number, object, shape, string } from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash/omit';
import config from '../../config';
import routeConfiguration from '../../routeConfiguration';
import { FormattedMessage } from '../../util/reactIntl';
import { createResourceLocatorString } from '../../util/routes';
import { isAnyFilterActive } from '../../util/search';
import { propTypes } from '../../util/types';
import {
  SearchResultsPanel,
  SearchFiltersMobile,
  SearchFiltersPrimary,
  SearchFiltersSecondary,
  SortBy,
  Button,
  AvatarMedium,
} from '../../components';
import { Form as FinalForm, Field } from 'react-final-form';
import searchiconbtn from '../../assets/Icon-awesome-search.svg';

import FilterComponent from './FilterComponent';
import { validFilterParams } from './SearchPage.helpers';

import css from './SearchPage.module.css';
import SectionAvatar from '../ListingPage/SectionAvatar';

// Primary filters have their content in dropdown-popup.
// With this offset we move the dropdown to the left a few pixels on desktop layout.
const FILTER_DROPDOWN_OFFSET = -14;

const cleanSearchFromConflictingParams = (searchParams, sortConfig, filterConfig) => {
  // Single out filters that should disable SortBy when an active
  // keyword search sorts the listings according to relevance.
  // In those cases, sort parameter should be removed.
  const sortingFiltersActive = isAnyFilterActive(
    sortConfig.conflictingFilters,
    searchParams,
    filterConfig
  );
  return sortingFiltersActive
    ? { ...searchParams, [sortConfig.queryParamName]: null }
    : searchParams;
};

/**
 * MainPanel contains search results and filters.
 * There are 3 presentational container-components that show filters:
 * SearchfiltersMobile, SearchFiltersPrimary, and SearchFiltersSecondary.
 * The last 2 are for desktop layout.
 */
class MainPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSecondaryFiltersOpen: false,
      currentQueryParams: props.urlQueryParams,
      practiceArea: '',
      country: '',
      languages: '',
      city: '',
      industry: '',
      state: '',
      zip: '',
    };

    this.applyFilters = this.applyFilters.bind(this);
    this.cancelFilters = this.cancelFilters.bind(this);
    this.resetAll = this.resetAll.bind(this);

    this.initialValues = this.initialValues.bind(this);
    this.getHandleChangedValueFn = this.getHandleChangedValueFn.bind(this);

    // SortBy
    this.handleSortBy = this.handleSortBy.bind(this);
  }

  // Apply the filters by redirecting to SearchPage with new filters.
  applyFilters() {
    const { history, urlQueryParams, sortConfig, filterConfig } = this.props;
    const searchParams = { ...urlQueryParams, ...this.state.currentQueryParams };
    // const searchParams=this.state.practiceArea?{ ...urlQueryParams,...{pub_practiceArea=this.state.practiceArea}}:urlQueryParams
    const search = cleanSearchFromConflictingParams(searchParams, sortConfig, filterConfig);

    Object.keys(search).forEach(key => {
      if (search[key] === '') {
        delete search[key];
      }
    });

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, search));
  }

  // Close the filters by clicking cancel, revert to the initial params
  cancelFilters() {
    this.setState({ currentQueryParams: {} });
  }

  // Reset all filter query parameters
  resetAll(e) {
    const { urlQueryParams, history, filterConfig } = this.props;
    const filterQueryParamNames = filterConfig.map(f => f.queryParamNames);

    // Reset state
    this.setState({ currentQueryParams: {} });

    // Reset routing params
    const queryParams = omit(urlQueryParams, filterQueryParamNames);
    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  }

  initialValues(queryParamNames) {
    // Query parameters that are visible in the URL
    const urlQueryParams = this.props.urlQueryParams;
    // Query parameters that are in state (user might have not yet clicked "Apply")
    const currentQueryParams = this.state.currentQueryParams;

    // Get initial value for a given parameter from state if its there.
    const getInitialValue = paramName => {
      const currentQueryParam = currentQueryParams[paramName];
      const hasQueryParamInState = typeof currentQueryParam !== 'undefined';
      return hasQueryParamInState ? currentQueryParam : urlQueryParams[paramName];
    };

    // Return all the initial values related to given queryParamNames
    // InitialValues for "amenities" filter could be
    // { amenities: "has_any:towel,jacuzzi" }
    const isArray = Array.isArray(queryParamNames);
    return isArray
      ? queryParamNames.reduce((acc, paramName) => {
          return { ...acc, [paramName]: getInitialValue(paramName) };
        }, {})
      : {};
  }

  getHandleChangedValueFn(useHistoryPush) {
    const { urlQueryParams, history, sortConfig, filterConfig } = this.props;

    return updatedURLParams => {
      const updater = prevState => {
        const { address, bounds } = urlQueryParams;
        const mergedQueryParams = { ...urlQueryParams, ...prevState.currentQueryParams };

        // Address and bounds are handled outside of MainPanel.
        // I.e. TopbarSearchForm && search by moving the map.
        // We should always trust urlQueryParams with those.
        return {
          currentQueryParams: { ...mergedQueryParams, ...updatedURLParams, address, bounds },
        };
      };

      const callback = () => {
        if (useHistoryPush) {
          const searchParams = this.state.currentQueryParams;
          const search = cleanSearchFromConflictingParams(searchParams, sortConfig, filterConfig);
          history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, search));
        }
      };

      this.setState(updater, callback);
    };
  }

  handleSortBy(urlParam, values) {
    const { history, urlQueryParams } = this.props;
    const queryParams = values
      ? { ...urlQueryParams, [urlParam]: values }
      : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  }

  render() {
    const {
      className,
      rootClassName,
      urlQueryParams,
      listings,
      searchInProgress,
      searchListingsError,
      searchParamsAreInSync,
      onActivateListing,
      onManageDisableScrolling,
      onOpenModal,
      onCloseModal,
      onMapIconClick,
      pagination,
      searchParamsForPagination,
      showAsModalMaxWidth,
      filterConfig,
      sortConfig,
      liveEdit,
      showAsPopup,
      areaOfLawOptions,
      countryLanguage,
    } = this.props;

    const useHistoryPush = liveEdit || showAsPopup;

    const primaryFilters = filterConfig.filter(f => f.group === 'primary');
    const secondaryFilters = filterConfig.filter(f => f.group !== 'primary');
    const hasSecondaryFilters = !!(secondaryFilters && secondaryFilters.length > 0);

    // Selected aka active filters
    const selectedFilters = validFilterParams(urlQueryParams, filterConfig);
    const selectedFiltersCount = Object.keys(selectedFilters).length;

    // Selected aka active secondary filters
    const selectedSecondaryFilters = hasSecondaryFilters
      ? validFilterParams(urlQueryParams, secondaryFilters)
      : {};
    const selectedSecondaryFiltersCount = Object.keys(selectedSecondaryFilters).length;

    const isSecondaryFiltersOpen = !!hasSecondaryFilters && this.state.isSecondaryFiltersOpen;
    const propsForSecondaryFiltersToggle = hasSecondaryFilters
      ? {
          isSecondaryFiltersOpen: this.state.isSecondaryFiltersOpen,
          toggleSecondaryFiltersOpen: isOpen => {
            this.setState({ isSecondaryFiltersOpen: isOpen });
          },
          selectedSecondaryFiltersCount,
        }
      : {};

    // With time-based availability filtering, pagination is NOT
    // supported. In these cases we get the pagination support info in
    // the response meta object, and we can use the count of listings
    // as the result count.
    //
    // See: https://www.sharetribe.com/api-reference/marketplace.html#availability-filtering
    const hasPaginationInfo = !!pagination && !pagination.paginationUnsupported;
    const listingsLength = listings ? listings.length : 0;
    const totalItems =
      searchParamsAreInSync && hasPaginationInfo ? pagination.totalItems : listingsLength;

    const listingsAreLoaded = !searchInProgress && searchParamsAreInSync;

    const sortBy = mode => {
      const conflictingFilterActive = isAnyFilterActive(
        sortConfig.conflictingFilters,
        urlQueryParams,
        filterConfig
      );

      const mobileClassesMaybe =
        mode === 'mobile'
          ? {
              rootClassName: css.sortBy,
              menuLabelRootClassName: css.sortByMenuLabel,
            }
          : {};
      return sortConfig.active ? (
        <SortBy
          {...mobileClassesMaybe}
          sort={urlQueryParams[sortConfig.queryParamName]}
          isConflictingFilterActive={!!conflictingFilterActive}
          onSelect={this.handleSortBy}
          showAsPopup
          contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
        />
      ) : null;
    };

    const classes = classNames(rootClassName || css.searchResultContainer, className);

    return (
      <div className={classes}>
        {/* <form > */}
        <div className={css.sectionContent}>
          <div className={css.updthmform}>
            <h2>Find Legal Advice Online</h2>
            <p>Find experienced lawyers you need. Anytime. Anywhere.</p>

            <div className={css.lformrow}>
              <div className={css.lformcol}>
                <label>Country</label>
                <select
                  className={css.formcontrol}
                  onChange={e => {
                    this.setState({ country: e.target.value });
                    this.getHandleChangedValueFn()({
                      ['pub_country']: e.target.value,
                    });
                  }}
                >
                  <option value="">Select Country</option>
                  {countryLanguage.map(m => (
                    <option value={m.country}>{m.country}</option>
                  ))}
                </select>
                {/* <FieldTextInput className={css.firstName} type="text" />
                  <FieldSelect
                    // id="timeZone"
                    name="timeZone"
                  >
                    <option value="">aa</option>
                    <option value="first">bbb</option>
                    <option value="second">ccc</option>
                  </FieldSelect> */}
              </div>

              {this.state.country === 'United States' ? (
                <>
                  <div className={css.lformcol}>
                    <label>State</label>
                    <select className={css.formcontrol}>
                      <option
                        selected
                        onChange={e => {
                          this.setState({ state: e.target.value });
                          this.getHandleChangedValueFn()({
                            ['pub_state']: e.target.value,
                          });
                        }}
                      >
                        Select State
                      </option>
                      <option>adasd</option>
                      <option>adasd</option>
                    </select>
                  </div>

                  <div className={css.lformcol}>
                    <label>ZIP</label>
                    <input type="text" className={css.formcontrol} placeholder="Type ZIP Code" />
                  </div>
                </>
              ) : (
                <div className={css.lformcol}>
                  <label>City</label>
                  <input type="text" className={css.formcontrol} placeholder="Enter City Name" />
                </div>
              )}

              <div className={css.lformcol}>
                <label>Practice Area</label>
                <select
                  className={css.formcontrol}
                  onChange={e => {
                    this.setState({ practiceArea: e.target.value });
                    this.getHandleChangedValueFn()({
                      ['pub_practiceArea']: e.target.value,
                    });
                  }}
                >
                  <option value="">Select Practice Area</option>
                  {areaOfLawOptions.map(m => (
                    <option value={m.key}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={css.lformrow}>
              <div className={css.lformcol}>
                <label>Keyword</label>
                <input type="text" className={css.formcontrol} placeholder="Type Keyword" />
              </div>

              <div className={css.lformcol}>
                <label>Language</label>
                <select
                  className={css.formcontrol}
                  onChange={e => {
                    this.setState({ languages: e.target.value });
                    this.getHandleChangedValueFn()({
                      ['pub_languages']: e.target.value,
                    });
                  }}
                >
                  <option selected>Select Language</option>
                  {countryLanguage
                    .filter(c => c.country === this.state.country)[0]
                    ?.languages?.map(l => (
                      <option value={l}>{l}</option>
                    ))}
                </select>
              </div>

              <div className={css.lformcol}>
                <label>Industry</label>
                <select
                  className={css.formcontrol}
                  onChange={e => {
                    this.setState({ industry: e.target.value });
                    this.getHandleChangedValueFn()({
                      ['pub_industry']: e.target.value,
                    });
                  }}
                >
                  <option value="" selected>
                    Select Industry
                  </option>
                  <option>adasd</option>
                  <option>adasd</option>
                </select>
              </div>
            </div>
            <Button
              className={css.submitButton}
              type="submit"
              onClick={() => {
                this.applyFilters();
              }}
            >
              <img src={searchiconbtn} /> Find Legal Advice
            </Button>

            {/* <p className={css.aylbtntxt}>
              Are you a lawyer?
               <Link to="/">Join us now!</Link> 
            </p> */}
          </div>
        </div>
        {/* </form> */}
        {/* <SearchFiltersPrimary
          className={css.searchFiltersPrimary}
          sortByComponent={sortBy('desktop')}
          listingsAreLoaded={listingsAreLoaded}
          resultsCount={totalItems}
          searchInProgress={searchInProgress}
          searchListingsError={searchListingsError}
          {...propsForSecondaryFiltersToggle}
        >
          {primaryFilters.map(config => {
            return (
              <FilterComponent
                key={`SearchFiltersPrimary.${config.id}`}
                idPrefix="SearchFiltersPrimary"
                filterConfig={config}
                urlQueryParams={urlQueryParams}
                initialValues={this.initialValues}
                getHandleChangedValueFn={this.getHandleChangedValueFn}
                showAsPopup
                contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
              />
            );
          })}
        </SearchFiltersPrimary> */}
        {/* <SearchFiltersMobile
          className={css.searchFiltersMobile}
          urlQueryParams={urlQueryParams}
          sortByComponent={sortBy('mobile')}
          listingsAreLoaded={listingsAreLoaded}
          resultsCount={totalItems}
          searchInProgress={searchInProgress}
          searchListingsError={searchListingsError}
          showAsModalMaxWidth={showAsModalMaxWidth}
          onMapIconClick={onMapIconClick}
          onManageDisableScrolling={onManageDisableScrolling}
          onOpenModal={onOpenModal}
          onCloseModal={onCloseModal}
          resetAll={this.resetAll}
          selectedFiltersCount={selectedFiltersCount}
        >
          {filterConfig.map(config => {
            return (
              <FilterComponent
                key={`SearchFiltersMobile.${config.id}`}
                idPrefix="SearchFiltersMobile"
                filterConfig={config}
                urlQueryParams={urlQueryParams}
                initialValues={this.initialValues}
                getHandleChangedValueFn={this.getHandleChangedValueFn}
                liveEdit
                showAsPopup={false}
              />
            );
          })}
        </SearchFiltersMobile> */}
        {isSecondaryFiltersOpen ? (
          <div className={classNames(css.searchFiltersPanel)}>
            <SearchFiltersSecondary
              urlQueryParams={urlQueryParams}
              listingsAreLoaded={listingsAreLoaded}
              applyFilters={this.applyFilters}
              cancelFilters={this.cancelFilters}
              resetAll={this.resetAll}
              onClosePanel={() => this.setState({ isSecondaryFiltersOpen: false })}
            >
              {secondaryFilters.map(config => {
                return (
                  <FilterComponent
                    key={`SearchFiltersSecondary.${config.id}`}
                    idPrefix="SearchFiltersSecondary"
                    filterConfig={config}
                    urlQueryParams={urlQueryParams}
                    initialValues={this.initialValues}
                    getHandleChangedValueFn={this.getHandleChangedValueFn}
                    showAsPopup={false}
                  />
                );
              })}
            </SearchFiltersSecondary>
          </div>
        ) : (
          <div
            className={classNames(css.listings, {
              [css.newSearchInProgress]: !listingsAreLoaded,
            })}
          >
            {searchListingsError ? (
              <h2 className={css.error}>
                <FormattedMessage id="SearchPage.searchError" />
              </h2>
            ) : null}
            <SearchResultsPanel
              className={css.searchListingsPanel}
              listings={listings}
              pagination={listingsAreLoaded ? pagination : null}
              search={searchParamsForPagination}
              setActiveListing={onActivateListing}
            />
          </div>
        )}
      </div>
    );
  }
}

MainPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listings: [],
  resultsCount: 0,
  pagination: null,
  searchParamsForPagination: {},
  filterConfig: config.custom.filters,
  sortConfig: config.custom.sortConfig,
  areaOfLawOptions: config.custom.areaOfLaw.options,
  countryLanguage: config.custom.countryLanguage,
};

MainPanel.propTypes = {
  className: string,
  rootClassName: string,

  urlQueryParams: object.isRequired,
  listings: array,
  searchInProgress: bool.isRequired,
  searchListingsError: propTypes.error,
  searchParamsAreInSync: bool.isRequired,
  onActivateListing: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  onOpenModal: func.isRequired,
  onCloseModal: func.isRequired,
  onMapIconClick: func.isRequired,
  pagination: propTypes.pagination,
  searchParamsForPagination: object,
  showAsModalMaxWidth: number.isRequired,
  filterConfig: propTypes.filterConfig,
  sortConfig: propTypes.sortConfig,
  areaOfLawOptions: propTypes.areaOfLawOptions,
  countryLanguage: array,

  history: shape({
    push: func.isRequired,
  }).isRequired,
};

export default MainPanel;
