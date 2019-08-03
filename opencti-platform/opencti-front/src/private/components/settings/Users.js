import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { QueryRenderer } from '../../../relay/environment';
import inject18n from '../../../components/i18n';
import ListLines from '../../../components/list_lines/ListLines';
import UsersLines, { usersLinesQuery } from './users/UsersLines';
import UserCreation from './users/UserCreation';

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'name',
      orderAsc: true,
      searchTerm: '',
      view: 'lines',
    };
  }

  handleSearch(value) {
    this.setState({ searchTerm: value });
  }

  handleSort(field, orderAsc) {
    this.setState({ sortBy: field, orderAsc });
  }

  renderLines(paginationOptions) {
    const { sortBy, orderAsc } = this.state;
    const dataColumns = {
      name: {
        label: 'Name',
        width: '20%',
        isSortable: true,
      },
      email: {
        label: 'Email',
        width: '30%',
        isSortable: true,
      },
      firstname: {
        label: 'Firstname',
        width: '15%',
        isSortable: true,
      },
      lastname: {
        label: 'Lastname',
        width: '15%',
        isSortable: true,
      },
      created: {
        label: 'Creation date',
        width: '15%',
        isSortable: true,
      },
    };
    return (
      <ListLines
        sortBy={sortBy}
        orderAsc={orderAsc}
        dataColumns={dataColumns}
        handleSort={this.handleSort.bind(this)}
        handleSearch={this.handleSearch.bind(this)}
        displayImport={false}
        secondaryAction={true}
      >
        <QueryRenderer
          query={usersLinesQuery}
          variables={{ count: 25, ...paginationOptions }}
          render={({ props }) => (
            <UsersLines
              data={props}
              paginationOptions={paginationOptions}
              dataColumns={dataColumns}
              initialLoading={props === null}
            />
          )}
        />
      </ListLines>
    );
  }

  render() {
    const {
      view, sortBy, orderAsc, searchTerm,
    } = this.state;
    const paginationOptions = {
      isUser: true,
      search: searchTerm,
      orderBy: sortBy,
      orderMode: orderAsc ? 'asc' : 'desc',
    };
    return (
      <div>
        {view === 'lines' ? this.renderLines(paginationOptions) : ''}
        <UserCreation paginationOptions={paginationOptions} />
      </div>
    );
  }
}

Users.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(inject18n)(Users);