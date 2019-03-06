import { useState, useContext, useEffect } from 'react';
import { loadRule } from '@validate-me/core/rules';
import { getMessage } from '@validate-me/core/dictionary';

import { FieldContext } from './ValidatemeForm';

export default function useInput({ validations, value, name, type, required }) {
  // Context para pasar el callback al form
  const setField = useContext(FieldContext);
  // Estados propios del input
  const [pristine, setPristine] = useState(true);
  const [error, setError] = useState();
  const [rules, setRules] = useState([]);
  const [newValue, onChangeValue] = useState(value);

  // Efectos que se invocan al montarse y en cada actualización
  // (siempre y cuando cambiaron los valores de los que depende)

  // 1. Instancia todas las reglas de validación
  useEffect(() => {
    const baseValidations = required ? ['required'] : [];

    if (type) {
      baseValidations.push(type);
    }

    const allRules = validations
      ? baseValidations.concat(validations)
      : baseValidations;

    Promise.all(allRules.map(loadRule)).then(setRules);
  }, [required, type, validations]);

  // 2. Ejecuta las reglas
  useEffect(() => {
    for (const rule of rules) {
      const isValid = rule.run(newValue);

      if (!isValid) {
        setError(getMessage(rule.name, newValue, rule.args));

        return;
      }
    }

    setError();
  }, [newValue, rules]);

  // 3. Le pasa su estado al form.
  useEffect(() => {
    const field = { invalid: pristine || error };

    if (pristine) {
      field.touch = () => setPristine(false);
    }

    setField({ name, field });
  }, [name, error, pristine, setField]);

  return [
    {
      pristine,
      error,
    },
    {
      required,
      name,
      type,
      value: newValue,
      onChange: evt => onChangeValue(evt.target.value),
      // onBlur.once
      onBlur: pristine ? () => setPristine(false) : undefined,
    },
  ];
}
