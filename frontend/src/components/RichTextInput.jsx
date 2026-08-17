import React, { useRef, useEffect, useCallback } from 'react';

const RichTextInput = ({
  value = '',
  onChange = () => {},
  placeholder = '',
  style = {},
  className = '',
  id = '',
  ...rest
}) => {
  const ref = useRef(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (ref.current) {
      const currentHtml = ref.current.innerHTML;
      if (currentHtml !== value) {
        isInternalUpdate.current = true;
        ref.current.innerHTML = value || '';
        isInternalUpdate.current = false;
      }
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (!isInternalUpdate.current && ref.current) {
      onChange(ref.current.innerHTML);
    }
  }, [onChange]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      id={id}
      data-placeholder={placeholder}
      onInput={handleInput}
      style={{
        minHeight: '80px',
        padding: '8px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '14px',
        fontFamily: 'inherit',
        outline: 'none',
        overflowY: 'auto',
        wordBreak: 'break-word',
        ...style
      }}
      className={className}
      {...rest}
    />
  );
};

export default RichTextInput;
