import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import graphql from 'babel-plugin-relay/macro';
import { createFragmentContainer } from 'react-relay';
import { Formik, Field, Form } from 'formik';
import {
  compose, insert, find, propEq, pick,
} from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { Close } from '@material-ui/icons';
import * as Yup from 'yup';
import inject18n from '../../../../components/i18n';
import {
  commitMutation,
  requestSubscription,
} from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import {
  SubscriptionAvatars,
  SubscriptionFocus,
} from '../../../../components/Subscription';

const styles = theme => ({
  header: {
    backgroundColor: theme.palette.navAlt.backgroundHeader,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
  },
  importButton: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.navAlt.background,
    color: theme.palette.header.text,
    borderBottom: '1px solid #5c5c5c',
  },
  title: {
    float: 'left',
  },
});

const subscription = graphql`
  subscription ExternalReferenceEditionSubscription($id: ID!) {
    externalReference(id: $id) {
      ...ExternalReferenceEdition_externalReference
    }
  }
`;

const externalReferenceMutationFieldPatch = graphql`
  mutation ExternalReferenceEditionFieldPatchMutation(
    $id: ID!
    $input: EditInput!
  ) {
    externalReferenceEdit(id: $id) {
      fieldPatch(input: $input) {
        ...ExternalReferenceEdition_externalReference
      }
    }
  }
`;

const externalReferenceEditionFocus = graphql`
  mutation ExternalReferenceEditionFocusMutation(
    $id: ID!
    $input: EditContext!
  ) {
    externalReferenceEdit(id: $id) {
      contextPatch(input: $input) {
        ...ExternalReferenceEdition_externalReference
      }
    }
  }
`;

const externalReferenceValidation = t => Yup.object().shape({
  source_name: Yup.string().required(t('This field is required')),
  external_id: Yup.string(),
  url: Yup.string().url(t('The value must be an URL')),
  description: Yup.string(),
});

class ExternalReferenceEditionContainer extends Component {
  componentDidMount() {
    const sub = requestSubscription({
      subscription,
      variables: {
        // eslint-disable-next-line
        id: this.props.externalReference.id
      },
    });
    this.setState({ sub });
  }

  componentWillUnmount() {
    this.state.sub.dispose();
  }

  handleChangeFocus(name) {
    commitMutation({
      mutation: externalReferenceEditionFocus,
      variables: {
        id: this.props.externalReference.id,
        input: {
          focusOn: name,
        },
      },
    });
  }

  handleSubmitField(name, value) {
    externalReferenceValidation(this.props.t)
      .validateAt(name, { [name]: value })
      .then(() => {
        commitMutation({
          mutation: externalReferenceMutationFieldPatch,
          variables: {
            id: this.props.externalReference.id,
            input: { key: name, value },
          },
        });
      })
      .catch(() => false);
  }

  render() {
    const {
      t, classes, handleClose, externalReference, me,
    } = this.props;
    const { editContext } = externalReference;
    // Add current user to the context if is not available yet.
    const missingMe = find(propEq('name', me.email))(editContext) === undefined;
    const editUsers = missingMe
      ? insert(0, { name: me.email }, editContext)
      : editContext;
    const initialValues = pick(
      ['source_name', 'external_id', 'url', 'description'],
      externalReference,
    );
    return (
      <div>
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={handleClose.bind(this)}
          >
            <Close fontSize="small" />
          </IconButton>
          <Typography variant="h6" classes={{ root: classes.title }}>
            {t('Update an external reference')}
          </Typography>
          <SubscriptionAvatars users={editUsers} />
          <div className="clearfix" />
        </div>
        <div className={classes.container}>
          <Formik
            enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={externalReferenceValidation(t)}
            render={() => (
              <Form style={{ margin: '20px 0 20px 0' }}>
                <Field
                  name="source_name"
                  component={TextField}
                  label={t('Source name')}
                  fullWidth={true}
                  onFocus={this.handleChangeFocus.bind(this)}
                  onSubmit={this.handleSubmitField.bind(this)}
                  helperText={
                    <SubscriptionFocus
                      me={me}
                      users={editUsers}
                      fieldName="source_name"
                    />
                  }
                />
                <Field
                  name="external_id"
                  component={TextField}
                  label={t('External ID')}
                  fullWidth={true}
                  style={{ marginTop: 10 }}
                  onFocus={this.handleChangeFocus.bind(this)}
                  onSubmit={this.handleSubmitField.bind(this)}
                  helperText={
                    <SubscriptionFocus
                      me={me}
                      users={editUsers}
                      fieldName="external_id"
                    />
                  }
                />
                <Field
                  name="url"
                  component={TextField}
                  label={t('URL')}
                  fullWidth={true}
                  style={{ marginTop: 10 }}
                  onFocus={this.handleChangeFocus.bind(this)}
                  onSubmit={this.handleSubmitField.bind(this)}
                  helperText={
                    <SubscriptionFocus
                      me={me}
                      users={editUsers}
                      fieldName="url"
                    />
                  }
                />
                <Field
                  name="description"
                  component={TextField}
                  label={t('Description')}
                  fullWidth={true}
                  multiline={true}
                  rows={4}
                  style={{ marginTop: 10 }}
                  onFocus={this.handleChangeFocus.bind(this)}
                  onSubmit={this.handleSubmitField.bind(this)}
                  helperText={
                    <SubscriptionFocus
                      me={me}
                      users={editUsers}
                      fieldName="description"
                    />
                  }
                />
              </Form>
            )}
          />
        </div>
      </div>
    );
  }
}

ExternalReferenceEditionContainer.propTypes = {
  handleClose: PropTypes.func,
  classes: PropTypes.object,
  externalReference: PropTypes.object,
  me: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

const ExternalReferenceEditionFragment = createFragmentContainer(
  ExternalReferenceEditionContainer,
  {
    externalReference: graphql`
      fragment ExternalReferenceEdition_externalReference on ExternalReference {
        id
        source_name
        url
        external_id
        description
        editContext {
          name
          focusOn
        }
      }
    `,
    me: graphql`
      fragment ExternalReferenceEdition_me on User {
        email
      }
    `,
  },
);

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(ExternalReferenceEditionFragment);
