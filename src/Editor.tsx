import { Button, Card, Flex, Inline, Spinner, Stack, Text } from '@sanity/ui'
import { CloseIcon, GenerateIcon } from '@sanity/icons'
import { DialogLabels, EditorLayout, SanityDocument } from '@types'
import * as React from 'react'
import Frame, { FrameContextConsumer } from 'react-frame-component'
import { StyleSheetManager } from 'styled-components'

import EditorField from './EditorField'
import LayoutsPicker from './LayoutsPicker'
import useEditorLogic from './useEditorLogic'

export interface EditorProps {
  layouts: EditorLayout[]
  onSelect?: (...props: any) => void
  onClose?: () => void
  dialog?: DialogLabels
  document: SanityDocument
}

const DEFAULT_DIMENSIONS = {
  width: 1200,
  height: 630,
}

const Editor: React.FC<EditorProps> = (props) => {
  const {
    activeLayout,
    setActiveLayout,
    generateImage,
    disabled,
    captureRef,
    data,
    setData,
  } = useEditorLogic(props)

  const LayoutComponent = activeLayout.component as any
  const fields = activeLayout.fields || []

  const width = activeLayout.dimensions?.width || DEFAULT_DIMENSIONS.width
  const height = activeLayout.dimensions?.height || DEFAULT_DIMENSIONS.height

  return (
    <Card
      scheme="light"
      height="fill"
      sizing="border"
      display="flex"
      style={{ flexDirection: 'column' }}
    >
      <Card
        tone="default"
        padding={4}
        marginBottom={[4, 0]}
        borderBottom={true}
        style={{ textAlign: 'right' }}
      >
        <Flex justify="space-between" align="center">
          <Inline space={3}>
            <Text size={3} weight="semibold">
              {props.dialog?.title || 'Create image'}
            </Text>
            <Button
              icon={disabled ? Spinner : GenerateIcon}
              tone="positive"
              text={props.dialog?.finishCta || 'Generate'}
              onClick={generateImage}
              disabled={disabled}
            />
          </Inline>
          {/* If onClose is defined, we're in an assetSource, where we should provide a header with a close button */}
          {props.onClose && (
            <Button
              onClick={props.onClose}
              icon={CloseIcon}
              mode="bleed"
              tone="critical"
              title={props.dialog?.ariaClose || 'close'}
            ></Button>
          )}
        </Flex>
      </Card>
      <Flex
        justify="flex-start"
        align="flex-start"
        wrap="wrap"
        overflow="auto"
        style={{ width: '100%', height: 'auto', minHeight: '0' }}
        sizing="border"
        padding={3}
      >
        <Card
          padding={3}
          marginRight={4}
          style={{ maxWidth: '350px', flex: '1 0 200px' }}
          sizing="border"
        >
          <Stack space={4}>
            {fields.map((field) => (
              <EditorField
                field={field}
                updateData={(newData) => setData(newData)}
                data={data}
                disabled={disabled}
              />
            ))}
          </Stack>
        </Card>
        <Card
          height="fill"
          overflow="auto"
          style={{
            padding: '20px 10px',
            maxWidth: `${width + 10 * 2}px`,
          }}
          shadow={3}
          sizing="border"
        >
          <Stack space={3}>
            <LayoutsPicker
              layouts={props.layouts}
              activeLayout={activeLayout}
              disabled={disabled}
              setActiveLayout={setActiveLayout}
            />

            <Frame
              style={{
                width: `${width}px`,
                height: `${height}px`,
                boxSizing: 'border-box',
                border: 'none',
              }}
              ref={captureRef}
              initialContent={`<!DOCTYPE html><html>
                <head>
                  <style>
                    body, html, #generator-frame-root, .frame-content {
                      margin: 0;
                      width: ${width}px;
                      height: ${height}px;
                      boxSizing: border-box;
                    }
                    .frame-content {
                      padding: 0.1px;
                    }
                  </style>
                </head>
                <body><div id="generator-frame-root"></div></body>
              </html>`}
              mountTarget="#generator-frame-root"
            >
              <FrameContextConsumer>
                {({ document }) => {
                  return (
                    <StyleSheetManager target={document.head}>
                      <LayoutComponent {...data} __head={document.head} />
                    </StyleSheetManager>
                  )
                }}
              </FrameContextConsumer>
            </Frame>
          </Stack>
        </Card>
      </Flex>
    </Card>
  )
}

export default Editor
