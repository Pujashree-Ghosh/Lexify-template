import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { array, bool, func, number, object, shape, string } from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash/omit';
import config from '../../config';
import routeConfiguration from '../../routeConfiguration';
import { FormattedMessage } from '../../util/reactIntl';
import { createResourceLocatorString } from '../../util/routes';
import { isAnyFilterActive } from '../../util/search';
import { propTypes } from '../../util/types';
import io from 'socket.io-client';

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
import axios from 'axios';
import Select from 'react-select';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withViewport } from '../../util/contextHelpers';
import { apiBaseUrl } from '../../util/api';

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
//creating options for react-select component

/**
 * MainPanel contains search results and filters.
 * There are 3 presentational container-components that show filters:
 * SearchfiltersMobile, SearchFiltersPrimary, and SearchFiltersSecondary.
 * The last 2 are for desktop layout.
 */
class MainPanelComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSecondaryFiltersOpen: false,
      currentQueryParams: props.urlQueryParams,
      practiceArea: [],
      country: [],
      languages: [],
      city: '',
      industry: [],
      state: [],
      postalCode: '',
      countryData: [],
      keywords: '',
      isSearched: false,
      isClearable: true,
    };

    this.applyFilters = this.applyFilters.bind(this);
    this.cancelFilters = this.cancelFilters.bind(this);
    this.resetAll = this.resetAll.bind(this);

    this.initialValues = this.initialValues.bind(this);
    this.getHandleChangedValueFn = this.getHandleChangedValueFn.bind(this);

    // SortBy
    this.handleSortBy = this.handleSortBy.bind(this);
  }
  componentDidMount() {
    axios
      .get('https://countriesnow.space/api/v0.1/countries/states')
      .then(res => {
        this.setState({ countryData: res.data.data });
      })
      .catch(err => console.log('Error occurred', err));

    //creating options for react-select component
    const practiceAreaOptions = this.props.areaOfLawOptions.map(c => ({
      value: c.key,
      label: c.label,
      key: c.key,
    }));
    const countryOptions = this.state.countryData.map(c => ({
      value: c.iso3,
      label: c.name,
      key: c.iso3,
    }));
    const languageOptions = this.props.languages.map(l => ({
      value: l.code,
      key: l.code,
      label: l.name,
    }));
    const industryOptions = [
      { value: 'industryA', label: 'Industry A' },
      { value: 'industryB', label: 'Industry B' },
      { value: 'industryC', label: 'Industry C' },
      { value: 'industryD', label: 'Industry D' },
      { value: 'industryE', label: 'Industry E' },
    ];
    const stateOptions = this.state.countryData
      .filter(c => c.iso3 === 'USA')[0]
      ?.states.map(s => ({ value: s.state_code, label: s.name, key: s.state_code }));

    this.setState({
      practiceArea: this.state.currentQueryParams?.hasOwnProperty('pub_practiceArea')
        ? practiceAreaOptions.filter(
            c => c.value === this.state.currentQueryParams?.pub_practiceArea
          )
        : [],
      country: this.state.currentQueryParams?.hasOwnProperty('pub_country')
        ? countryOptions.filter(c => c.value === this.state.currentQueryParams?.pub_country)
        : [],
      languages: this.state.currentQueryParams?.hasOwnProperty('pub_languages')
        ? languageOptions.filter(c => c.value === this.state.currentQueryParams?.pub_languages)
        : [],
      city: this.state.currentQueryParams?.hasOwnProperty('pub_city')
        ? this.state.currentQueryParams?.pub_city
        : '',
      industry: this.state.currentQueryParams?.hasOwnProperty('pub_industry')
        ? industryOptions.filter(c => c.value === this.state.currentQueryParams?.pub_industry)
        : [],
      state: this.state.currentQueryParams?.hasOwnProperty('pub_state')
        ? stateOptions?.filter(c => c?.value === this.state.currentQueryParams?.pub_state)
        : [],
      postalCode: this.state.currentQueryParams?.hasOwnProperty('pub_postalCode')
        ? this.state.currentQueryParams?.pub_postalCode
        : '',
      keywords: this.state.currentQueryParams?.hasOwnProperty('keywords')
        ? this.state.currentQueryParams?.keywords
        : '',
    });
  }
  // componentDidUpdate() {
  //   const { history, urlQueryParams } = this.props;
  //   // console.log('UQP',urlQueryParams)
  //   console.log("963",this.state.currentQueryParams)
  //   console.log("369",urlQueryParams)
  //   if (
  //     urlQueryParams?.pub_isProviderType !== true ||
  //     urlQueryParams?.pub_hasPublicListing !== true
  //   ) {
  //     // history.push(
  //     //   createResourceLocatorString(
  //     //     'SearchPage',
  //     //     routeConfiguration(),
  //     //     {},
  //     //     {pub_hasPublicListing:true, pub_isProviderType:true}
  //     //   )
  //     // );
  //     if (
  //       this.state.keywords === '' &&
  //       urlQueryParams?.pub_hasPublicListing === true &&
  //       urlQueryParams?.pub_isProviderType === true
  //     ) {
  //       history.push(
  //         createResourceLocatorString(
  //           'SearchPage',
  //           routeConfiguration(),
  //           {},
  //           { pub_hasPublicListing: true, pub_isProviderType: true }
  //         )
  //       );
  //     }

  //     if(this.state.currentQueryParams.hasOwnProperty('keywords') && urlQueryParams?.pub_hasPublicListing === true && urlQueryParams?.pub_isProviderType === true){
  //       let currParams = this.state.currentQueryParams;
  //       delete currParams?.pub_hasPublicListing;
  //       delete currParams?.pub_isProviderType;
  //       history.push(
  //         createResourceLocatorString(
  //           'SearchPage',
  //           routeConfiguration(),
  //           {},
  //           {...currParams}
  //         )
  //       );
  //     }
  //   }
  // }
  componentDidUpdate(prevProps, prevState) {
    // const socketServerURL = apiBaseUrl();
    // // this.setState({
    // //   socket: io(socketServerURL, {
    // //     query: {
    // //       roomId: decodeToken.room,
    // //     },
    // //   }),
    // // });
    // const socket = io(socketServerURL, {
    //   query: {
    //     roomId: '123',
    //   },
    // });
    // socket.on('connection', () => {
    //   console.log('abcdef', 'new client connected');
    // });
    // socket.emit('onConnect', '123', '123456');
    // socket.on('status', (status, id) => {
    //   console.log('abcde', status, id);
    // });
    // console.log('abcd', socket);

    const practiceAreaOptions = this.props.areaOfLawOptions.map(c => ({
      value: c.key,
      label: c.label,
      key: c.key,
    }));
    const countryOptions = this.state.countryData.map(c => ({
      value: c.iso3,
      label: c.name,
      key: c.iso3,
    }));
    const languageOptions = this.props.languages.map(l => ({
      value: l.code,
      key: l.code,
      label: l.name,
    }));
    const industryOptions = [
      { value: 'industryA', label: 'Industry A' },
      { value: 'industryB', label: 'Industry B' },
      { value: 'industryC', label: 'Industry C' },
      { value: 'industryD', label: 'Industry D' },
      { value: 'industryE', label: 'Industry E' },
    ];
    const stateOptions = this.state.countryData
      .filter(c => c.iso3 === 'USA')[0]
      ?.states.map(s => ({ value: s.state_code, label: s.name, key: s.state_code }));

    if (JSON.stringify(prevState.practiceArea) !== JSON.stringify(this.state.practiceArea)) {
      this.setState({
        practiceArea: this.state.currentQueryParams.hasOwnProperty('pub_practiceArea')
          ? practiceAreaOptions.filter(
              c => c.value === this.state.currentQueryParams?.pub_practiceArea
            )
          : [],
      });
    }
    if (
      prevState.country.length !== this.state.country.length ||
      this.state.countryData.length !== prevState.countryData.length
    ) {
      this.setState({
        country: this.state.currentQueryParams.hasOwnProperty('pub_country')
          ? countryOptions.filter(c => c.value === this.state.currentQueryParams?.pub_country)
          : [],
      });
    }
    if (
      JSON.stringify(prevState.state) !== JSON.stringify(this.state.state) ||
      this.state.countryData.length !== prevState.countryData.length
    ) {
      this.setState({
        state: this.state.currentQueryParams.hasOwnProperty('pub_state')
          ? stateOptions?.filter(c => c?.value === this.state.currentQueryParams?.pub_state)
          : [],
      });
    }
    if (JSON.stringify(prevState.industry) !== JSON.stringify(this.state.industry)) {
      this.setState({
        industry: this.state.currentQueryParams.hasOwnProperty('pub_industry')
          ? industryOptions.filter(c => c.value === this.state.currentQueryParams?.pub_industry)
          : [],
      });
    }
    if (JSON.stringify(prevState.languages) !== JSON.stringify(this.state.languages)) {
      this.setState({
        languages: this.state.currentQueryParams.hasOwnProperty('pub_languages')
          ? languageOptions.filter(c => c.value === this.state.currentQueryParams?.pub_languages)
          : [],
      });
    }

    const { history, urlQueryParams } = this.props;
    // if(Object.keys(urlQueryParams).length === 0){
    //   history.push(
    //     createResourceLocatorString(
    //       'SearchPage',
    //       routeConfiguration(),
    //       {},
    //       {...this.state.currentQueryParams}
    //     )
    //   );
    // }
    if (
      urlQueryParams &&
      Object.keys(urlQueryParams).length === 0 &&
      Object.getPrototypeOf(urlQueryParams) === Object.prototype
    ) {
      history.push(
        createResourceLocatorString(
          'SearchPage',
          routeConfiguration(),
          {},
          { pub_hasPublicListing: true, pub_isProviderType: true }
        )
      );
    }
    if (
      urlQueryParams?.pub_isProviderType !== true ||
      urlQueryParams?.pub_hasPublicListing !== true
    ) {
      // history.push(
      //   createResourceLocatorString(
      //     'SearchPage',
      //     routeConfiguration(),
      //     {},
      //     { pub_hasPublicListing: true, pub_isProviderType: true }
      //   )
      // );
      if (
        this.state.keywords === '' &&
        this.state.practiceArea.length < 1 &&
        urlQueryParams?.pub_hasPublicListing === true &&
        urlQueryParams?.pub_isProviderType === true
      ) {
        history.push(
          createResourceLocatorString(
            'SearchPage',
            routeConfiguration(),
            {},
            { pub_hasPublicListing: true, pub_isProviderType: true }
          )
        );
      }

      if (
        this.state.currentQueryParams.hasOwnProperty('keywords') &&
        urlQueryParams?.pub_hasPublicListing === true &&
        urlQueryParams?.pub_isProviderType === true
      ) {
        let currParams = this.state.currentQueryParams;
        delete currParams?.pub_hasPublicListing;
        delete currParams?.pub_isProviderType;
        history.push(
          createResourceLocatorString('SearchPage', routeConfiguration(), {}, { ...currParams })
        );
      }
      if (
        this.state.currentQueryParams.hasOwnProperty('pub_practiceArea') &&
        urlQueryParams?.pub_hasPublicListing === true &&
        urlQueryParams?.pub_isProviderType === true
      ) {
        let currParams = this.state.currentQueryParams;
        delete currParams?.pub_hasPublicListing;
        delete currParams?.pub_isProviderType;
        history.push(
          createResourceLocatorString('SearchPage', routeConfiguration(), {}, { ...currParams })
        );
      }
    }
  }
  // Apply the filters by redirecting to SearchPage with new filters.

  applyFilters() {
    const { history, urlQueryParams, sortConfig, filterConfig } = this.props;
    const searchParams = { ...urlQueryParams, ...this.state.currentQueryParams };
    const search = cleanSearchFromConflictingParams(searchParams, sortConfig, filterConfig);
    if (
      this.state.country[0]?.value === '' &&
      this.state.state[0]?.value === '' &&
      this.state.postalCode === '' &&
      this.state.city === '' &&
      this.state.practiceArea[0]?.value === '' &&
      this.state.keywords === '' &&
      this.state.languages[0]?.value === '' &&
      this.state.industry[0]?.value === ''
    ) {
    } else {
      if (this.state.keywords !== '' || this.state.practiceArea.length >= 1) {
        search.pub_category = 'publicOral';
        delete search.pub_isProviderType;
        delete search.pub_hasPublicListing;
      }
      if (this.state.keywords === '' && this.state.practiceArea.length < 1) {
        if (search.hasOwnProperty('pub_category')) {
          delete search.pub_category;
        }
      }
      Object.keys(search).forEach(key => {
        if (search[key] === '') {
          delete search[key];
        }
      });
      history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, search));
    }
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
      languages,
      history,
      currentUser,
    } = this.props;
    // console.log("listing",listings)
    const useHistoryPush = liveEdit || showAsPopup;
    //creating options for react-select component
    const practiceAreaOptions = areaOfLawOptions.map(c => ({
      value: c.key,
      label: c.label,
      key: c.key,
    }));
    const countryOptions = this.state.countryData.map(c => ({
      value: c.iso3,
      label: c.name,
      key: c.iso3,
    }));
    const languageOptions = languages.map(l => ({ value: l.code, key: l.code, label: l.name }));
    const industryOptions = [
      { value: 'industryA', label: 'Industry A' },
      { value: 'industryB', label: 'Industry B' },
      { value: 'industryC', label: 'Industry C' },
      { value: 'industryD', label: 'Industry D' },
      { value: 'industryE', label: 'Industry E' },
    ];
    const stateOptions = this.state.countryData
      .filter(c => c.iso3 === 'USA')[0]
      ?.states.map(s => ({ value: s.state_code, label: s.name, key: s.state_code }));
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

    // const signupLawyer = isAuthenticatedOrJustHydrated ? null : (
    //   <NamedLink name="SignupLawyerPage" className={css.signupLink}>
    //     <span className={css.signup}>
    //       <FormattedMessage id="TopbarDesktop.signupLawyer" />
    //     </span>
    //   </NamedLink>
    // );
    // console.log(signupLawyer)
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
    // console.log('state',this.state.currentQueryParams)
    const classes = classNames(rootClassName || css.searchResultContainer, className);
    return (
      <div className={classes}>
        <div className={css.sectionContent}>
          <div className={css.updthmform}>
            <h2>Find Legal Advice Online</h2>
            <p>Find experienced lawyers you need. Anytime. Anywhere.</p>

            <div className={css.lformrow}>
              <div className={css.lformcol}>
                <label>Country</label>
                <Select
                  isClearable={this.state.isClearable}
                  options={countryOptions}
                  value={this.state.country}
                  onChange={e => {
                    e === null ? this.setState({ country: [] }) : this.setState({ country: e });
                    this.getHandleChangedValueFn()({
                      ['pub_country']: e?.value,
                    });
                  }}
                >
                  {/* <option value="">Select Country</option>
                  {this.state.countryData.map(c => (
                    <option value={c.iso3} key={c.iso3}>
                      {c.name}
                    </option>
                  ))} */}
                </Select>
              </div>

              {this.state.country[0]?.value === 'USA' ? (
                <>
                  <div className={css.lformcol}>
                    <label>State</label>
                    <Select
                      value={this.state.state}
                      options={stateOptions}
                      isClearable={this.state.isClearable}
                      // className={css.formcontrol}
                      onChange={e => {
                        e === null ? this.setState({ state: [] }) : this.setState({ state: e });
                        this.getHandleChangedValueFn()({
                          ['pub_state']: e?.value,
                        });
                      }}
                    ></Select>
                  </div>

                  <div className={css.lformcol}>
                    <label>ZIP</label>
                    <input
                      type="text"
                      value={this.state.postalCode}
                      className={css.formcontrol}
                      placeholder="Type ZIP Code"
                      onChange={e => {
                        this.setState({ postalCode: e.target.value });
                        this.getHandleChangedValueFn()({
                          ['pub_postalCode']: e.target.value,
                        });
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className={css.lformcol}>
                  <label>City</label>
                  <input
                    value={this.state.city}
                    type="text"
                    className={css.formcontrol}
                    placeholder="Enter City Name"
                    onChange={e => {
                      this.setState({ city: e.target.value });
                      this.getHandleChangedValueFn()({
                        ['pub_city']: e.target.value,
                      });
                    }}
                  />
                </div>
              )}

              <div className={css.lformcol}>
                <label>Practice Area</label>
                <Select
                  value={this.state.practiceArea}
                  isClearable={this.state.isClearable}
                  options={practiceAreaOptions}
                  // className={css.formcontrol}
                  onChange={e => {
                    e === null
                      ? this.setState({ practiceArea: [] })
                      : this.setState({ practiceArea: e });
                    this.getHandleChangedValueFn()({
                      ['pub_practiceArea']: e?.value,
                    });
                  }}
                >
                  {/* <option value="">Select Practice Area</option>
                  {areaOfLawOptions.map(m => (
                    <option value={m.key} key={m.key}>
                      {m.label}
                    </option>
                  ))} */}
                </Select>
              </div>
            </div>
            <div className={css.lformrow}>
              <div className={css.lformcol}>
                <label>Keyword</label>
                <input
                  value={this.state.keywords}
                  type="text"
                  className={css.formcontrol}
                  placeholder="Type Keyword"
                  onChange={e => {
                    this.setState({ keywords: e.target.value });
                    this.getHandleChangedValueFn()({
                      ['keywords']: e.target.value,
                    });
                  }}
                />
              </div>

              <div className={css.lformcol}>
                <label>Language</label>
                <Select
                  value={this.state.languages}
                  isClearable={this.state.isClearable}
                  options={languageOptions}
                  // className={css.formcontrol}
                  onChange={e => {
                    e === null ? this.setState({ languages: [] }) : this.setState({ languages: e });
                    this.getHandleChangedValueFn()({
                      ['pub_languages']: e?.value,
                    });
                  }}
                >
                  {/* <option value="">Select Language</option>
                  {languages.map(l => (
                    <option value={l.code} key={l.code}>
                      {l.name}
                    </option>
                  ))} */}
                </Select>
              </div>

              <div className={css.lformcol}>
                <label>Industry</label>
                <Select
                  value={this.state.industry}
                  isClearable={this.state.isClearable}
                  options={industryOptions}
                  // className={css.formcontrol}
                  onChange={e => {
                    e === null ? this.setState({ industry: [] }) : this.setState({ industry: e });
                    this.getHandleChangedValueFn()({
                      ['pub_industry']: e?.value,
                    });
                  }}
                >
                  {/* <option value="">Select Industry</option>
                  <option>adasd</option>
                  <option>adasd</option> */}
                </Select>
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
            {currentUser === null || typeof currentUser === undefined ? (
              <p className={css.aylbtntxt}>
                Are you a lawyer?
                <Link to="signup-lawyer">Join us now!</Link>
              </p>
            ) : (
              ''
            )}
          </div>
        </div>
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
            {urlQueryParams.pub_isProviderType === true &&
            urlQueryParams.pub_hasPublicListing === true &&
            Object.keys(urlQueryParams).length === 2 ? (
              ''
            ) : (
              <SearchResultsPanel
                className={css.searchListingsPanel}
                listings={listings}
                pagination={listingsAreLoaded ? pagination : null}
                search={searchParamsForPagination}
                setActiveListing={onActivateListing}
                history={history}
                totalItems={totalItems}
              />
            )}
            {/* <SearchResultsPanel
              className={css.searchListingsPanel}
              listings={listings}
              pagination={listingsAreLoaded ? pagination : null}
              search={searchParamsForPagination}
              setActiveListing={onActivateListing}
              history={history}
              totalItems={totalItems}
            /> */}
          </div>
        )}
      </div>
    );
  }
}

MainPanelComponent.defaultProps = {
  className: null,
  rootClassName: null,
  listings: [],
  resultsCount: 0,
  pagination: null,
  searchParamsForPagination: {},
  filterConfig: config.custom.filters,
  sortConfig: config.custom.sortConfig,
  areaOfLawOptions: config.custom.areaOfLaw.options,
  languages: config.custom.languages,
};

MainPanelComponent.propTypes = {
  className: string,
  rootClassName: string,
  currentUser: propTypes.currentUser,
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
  languages: array,

  history: shape({
    push: func.isRequired,
  }).isRequired,
};
const mapStateToProps = state => {
  const { currentUser } = state.user;

  return { currentUser };
};

const MainPanel = compose(connect(mapStateToProps))(MainPanelComponent);

export default MainPanel;
