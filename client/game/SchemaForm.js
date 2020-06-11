import React from 'react'
import { post } from '@unrest/core'
import Form from '@unrest/react-jsonschema-form'
import RestHook from '@unrest/react-rest-hook'

const withSchema = RestHook('/api/schema/${form_name}/')

export const uiSchema = {}

class BaseSchemaForm extends React.Component {
  onSubmit = (formData) => post(this.props.api.makeUrl(this.props), formData)
  render() {
    const { api, prepSchema = () => {}, ...props } = this.props
    const { loading, schema } = api
    if (loading) {
      return null
    }
    const form_props = {
      schema: prepSchema(schema) || schema,
      onSubmit: this.onSubmit,
      onSuccess: this.props.onSuccess,
      ...props,
    }
    return <Form uiSchema={uiSchema} {...form_props} />
  }
}

export default withSchema(BaseSchemaForm)
