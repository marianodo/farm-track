// const createNewMeasurement = async () => {
//   const newMeasurement = {
//     name: formData.name,
//     type_of_object_id: typeOfObjectId,
//     measurements: Object.entries(values)
//       .filter(([key, value]) => value !== null)
//       .map(([key, value]) => ({
//         pen_variable_type_of_object_id: Number(key),
//         value: value,
//         report_id: createReportId,
//       })),
//   };
//   await createMeasurementWithReportId(newMeasurement);
//   setModalVisible('success');
//   measurementVariablesData.map((e: any) => {
//     setValues((prevValues) => ({
//       ...prevValues,
//       [e.pen_variable_type_of_object_id]: null,
//     }));
//   });
//   setFormData({
//     name: null,
//     comment: null,
//   });
//   setErrors({});
//   setErrorsName([]);
//   setFormOk(false);
// };

// const getModalButtons = () => {
//   if (
//     formOk &&
//     !showWarningError &&
//     errorsName.length > 0 &&
//     errorsName.length === measurementVariablesData.length
//   ) {
//     return [
//       {
//         text: 'Cancelar',
//         onPress: () => setModalVisible(null),
//       },
//     ];
//   } else if (
//     !formOk &&
//     showWarningError &&
//     errorsName.length > 0 &&
//     errorsName.length < measurementVariablesData.length
//   ) {
//     return [
//       {
//         text: 'Continuar sin completar',
//         onPress: async () => {
//           setModalVisible(null);
//           setFormOk(true);
//           try {
//             await createNewMeasurement();
//           } catch (error) {
//             console.log('ERROR:', error);
//           }
//         },
//       },
//       {
//         text: 'Completar el campo',
//         onPress: () => setModalVisible(null),
//       },
//       {
//         text: 'No mostrar de nuevo',
//         onPress: async () => {
//           setShowWarningError(false);
//           setModalVisible(null);
//           setFormOk(true);
//           try {
//             await createNewMeasurement();
//           } catch (error) {
//             console.log('ERROR:', error);
//           }
//         },
//       },
//     ];
//   } else {
//     return [
//       {
//         text: 'cerrar',
//         onPress: () => setModalVisible(null),
//       },
//     ];
//   }
// };

// const handleSubmit = async () => {
//   const validationErrors = validateValues();
//   if (!formOk && validationErrors.length > 0) {
//     let title = 'Debes completar al menos un campo para guardar una medición.';
//     let subtitle: any = '';
//     if (
//       showWarningError &&
//       validationErrors.length < measurementVariablesData.length
//     ) {
//       title = 'Campo incompleto';
//       subtitle = (
//         <Text>
//           Parece que no has completado el campo{' '}
//           <Text style={{ fontWeight: 'bold' }}>
//             {validationErrors.join(', ')}
//           </Text>
//           . ¿Deseas continuar de todas formas?
//         </Text>
//       );
//     }
//     setFormOk(false);
//     setTexts({ title, subtitle });
//     setModalVisible('modal');
//     return;
//   }
//   if (
//     formOk &&
//     validationErrors.length === measurementVariablesData.length &&
//     !showWarningError
//   ) {
//     let title = 'Debes completar al menos un campo para guardar una medición.';
//     let subtitle = '';
//     setTexts({ title, subtitle });
//     setModalVisible('modal');
//     return;
//   }
//   try {
//     await createNewMeasurement();
//   } catch (error) {
//     console.log('ERROR:', error);
//   }
// };

//  <ModalComponent
//    visible={modalVisible === 'modal'}
//    onDismiss={() => setModalVisible(null)}
//    title={texts.title}
//    subtitle={texts.subtitle}
//    buttons={getModalButtons()}
//    marginVertical={'38%'}
//  />;

// const handleSubmit = async () => { const validationErrors = validateValues(); if (!formOk && validationErrors.length > 0) { let title = 'Debes completar al menos un campo para guardar una medición.'; let subtitle = ''; if ( showWarningError && validationErrors.length < measurementVariablesData.length ) { title = 'Campo incompleto'; subtitle = Parece que no has completado el campo ${validationErrors.join( ', ' )}. ¿Deseas continuar de todas formas?; } setFormOk(false); setTexts({ title, subtitle, }); setModalVisible('modal'); return; } if ( formOk && validationErrors.length === measurementVariablesData.length && !showWarningError ) { let title = 'Debes completar al menos un campo para guardar una medición.'; let subtitle = ''; // setFormOk(false); setTexts({ title, subtitle, }); setModalVisible('modal'); return; } try { const newMeasurement = { name: formData.name, type_of_object_id: typeOfObjectId, measurements: Object.entries(values) .filter(([key, value]) => value !== null) .map(([key, value]) => ({ pen_variable_type_of_object_id: Number(key), value: value, report_id: createReportId, })), }; await createMeasurementWithReportId(newMeasurement); setModalVisible('success'); measurementVariablesData.map((e: any) => { setValues((prevValues) => ({ ...prevValues, [e.pen_variable_type_of_object_id]: null, })); }); setFormData({ name: null, comment: null, }); setErrors({}); setErrorsName([]); setFormOk(false); } catch (error) { console.log('ERROR:', error); } };

{
  /* <ModalComponent
  visible={modalVisible === 'modal'}
  onDismiss={() => setModalVisible(null)}
  title={texts.title}
  subtitle={texts.subtitle}
  buttons={
    formOk &&
    !showWarningError &&
    errorsName.length > 0 &&
    errorsName.length === measurementVariablesData.length
      ? [{ text: 'Cancelar', onPress: () => setModalVisible(null) }]
      : !formOk &&
        showWarningError &&
        errorsName.length > 0 &&
        errorsName.length < measurementVariablesData.length
      ? [
          {
            text: 'Continuar sin completar',
            onPress: async () => {
              setModalVisible(null);
              setFormOk(true);
              try {
                const newMeasurement = {
                  name: formData.name,
                  type_of_object_id: typeOfObjectId,
                  measurements: Object.entries(values)
                    .filter(([key, value]) => value !== null)
                    .map(([key, value]) => ({
                      pen_variable_type_of_object_id: Number(key),
                      value: value,
                      report_id: createReportId,
                    })),
                };
                await createMeasurementWithReportId(newMeasurement);
                setModalVisible('success');
                measurementVariablesData.map((e: any) => {
                  setValues((prevValues) => ({
                    ...prevValues,
                    [e.pen_variable_type_of_object_id]: null,
                  }));
                });
                setFormData({ name: null, comment: null });
                setErrors({});
                setErrorsName([]);
                setFormOk(false);
              } catch (error) {
                console.log('ERROR:', error);
              }
            },
          },
          { text: 'Completar el campo', onPress: () => setModalVisible(null) },
          {
            text: 'No mostrar de nuevo',
            onPress: async () => {
              setShowWarningError(false);
              setModalVisible(null);
              setFormOk(true);
              try {
                const newMeasurement = {
                  name: formData.name,
                  type_of_object_id: typeOfObjectId,
                  measurements: Object.entries(values)
                    .filter(([key, value]) => value !== null)
                    .map(([key, value]) => ({
                      pen_variable_type_of_object_id: Number(key),
                      value: value,
                      report_id: createReportId,
                    })),
                };
                await createMeasurementWithReportId(newMeasurement);
                setModalVisible('success');
                measurementVariablesData.map((e: any) => {
                  setValues((prevValues) => ({
                    ...prevValues,
                    [e.pen_variable_type_of_object_id]: null,
                  }));
                });
                setFormData({ name: null, comment: null });
                setErrors({});
                setErrorsName([]);
                setFormOk(false);
              } catch (error) {
                console.log('ERROR:', error);
              }
            },
          },
        ]
      : [{ text: 'cerrar', onPress: () => setModalVisible(null) }]
  }
  marginVertical={'38%'}
/>; */
}

/* 
PRIMER ESTADO: 

ESTADOS: FORM OK: false VALIDATIONERROS: 2 ERRORS: {} SHOWWARNINGERROR: true MEASUREMENTVARIABLES 3
 LOG  ERORRES: {"Higiene de la ubre": "true", "Score de materia fecal": "true"}
 LOG  ERRORES NAMES: ["Score de materia fecal", "Higiene de la ubre"]



*/
