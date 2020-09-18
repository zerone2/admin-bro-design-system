/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import debounce from 'lodash/debounce'

import styled from 'styled-components'
import snow from './snow.styles'
import bubble from './bubble.styles'
import styles from './styles'
import Box from '../../atoms/box'
import { Quill as QuillClass } from 'quill/index'

export type RichTextProps = {
  value?: string;
  borderless?: boolean;
  onChange?: (content) => void;

  quill: {
    /** Theme - default to snow */
    theme?: 'snow' | 'bubble';
  }
}

const Theme = styled(Box)<RichTextProps>`
  ${bubble};
  ${snow};
  ${styles};
`

export const RichText: React.FC<RichTextProps> = (props) => {
  const { value, borderless, quill: options, onChange } = props

  options.theme = options.theme || 'snow'

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const Quill: typeof QuillClass = require('quill')

  const classNames: Array<string> = []
  if (borderless) {
    classNames.push('quill-borderless')
  }

  const [quill, setQuill] = useState<QuillClass | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const debouncedOnChange = useMemo(() => debounce(onChange || (() => true), 500), [onChange])

  useEffect(() => {
    if (editorRef.current) {
      const quillInstance = new Quill(editorRef.current, options)
      setQuill(quillInstance)
    }
    return () => {
      setQuill(null)
    }
  }, [])

  useEffect(() => {
    if (!editorRef.current || !quill) {
      return
    }
    if (value && quill.root.innerHTML !== value) {
      quill.root.innerHTML = value
    }
  }, [value, quill])

  useEffect(() => {
    const editor = quill?.root
    if (!editor) {
      return undefined
    }
    const handler = () => {
      const content = editor.innerHTML
      debouncedOnChange(content)
    }
    editor?.addEventListener('DOMSubtreeModified', handler)
    return () => {
      editor?.removeEventListener('DOMSubtreeModified', handler)
    }
  }, [debouncedOnChange, quill])

  return (
    <Theme quill={options}>
      <div className={classNames.join(' ')}>
        <div
          className="quill-editor"
          ref={editorRef}
        />
      </div>
    </Theme>
  )
}

export default RichText