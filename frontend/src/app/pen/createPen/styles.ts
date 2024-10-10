import { rMS, rMV } from '@/styles/responsive';
import { Dimensions, StyleSheet } from 'react-native';
const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    position: 'relative',
    height: '100%',
    alignItems: 'center',
  },
  spacer: {
    // flex: 1,
    height: '64%',
  },
  greeting: {
    color: '#fff',
    fontFamily: 'Pro-Regular',
    fontSize: rMS(13.6),
    marginRight: 200,
  },
  welcome: {
    marginLeft: 20,
    color: '#fff',
    fontFamily: 'Pro-Regular',
    fontSize: 22,
    fontWeight: 'bold',
  },
  attributeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: rMS(68),
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  floatingButton: {
    position: 'absolute',
    fontWeight: 'bold',
    zIndex: 99999,
    bottom: 20,
    right: 15,
    width: rMS(56),
    height: rMS(56),
    borderRadius: 30,
    backgroundColor: '#486732',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  leftActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    height: rMS(98),
    backgroundColor: '#f0f0f0',
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: rMS(52),
    backgroundColor: '#3A5228',
    width: 68,
  },
  deleteButton: {
    display: 'flex',

    alignItems: 'center',
    paddingBottom: rMS(52),
    backgroundColor: '#B82E2E',
    width: 68,
  },
  archiveButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  actionText: {
    color: '#fff',
    fontFamily: 'Pro-Regular',
    fontSize: 11.2,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 10,
    width: rMS(270),
    backgroundColor: '#EBF2ED',
  },
  modalInput: {
    width: rMS(238),
    height: rMV(32),
    borderWidth: 1.1,
    borderColor: '#96A59A',
    marginBottom: 20,
    paddingVertical: 5,
    borderRadius: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  createButton: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Pro-Regular',
    color: 'white',
    fontWeight: '600',
    fontSize: rMS(17),
  },
  fixedButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  button: {
    width: '100%',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#486732',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginVertical: height * 0.01,
    width: width * 0.9,
    height: height * 0.07,
    borderWidth: 1,
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#292929',
    borderColor: '#F1F1F1',
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  inputContainerNumber: {
    height: 'auto',
    paddingHorizontal: rMS(14),
    paddingVertical: 10,
    justifyContent: 'flex-start',
  },
  inputContainerCategorical: {
    height: 'auto',
    paddingHorizontal: rMS(14),
    paddingVertical: 10,
    justifyContent: 'flex-start',
  },
  textDefaultValues: {
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#292929',
  },
  textOptimalValues: {
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#292929',
    marginTop: rMS(16),
  },
  textGranularity: {
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#292929',
    marginTop: rMS(16),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  rowCategorical: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    alignItems: 'center',
  },
  textInput: {
    height: 48,
    flex: 1,
  },
  pressableButton: {
    width: 48,
    height: 48,
    backgroundColor: '#486732',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginLeft: 4,
  },
  pressableButtonText: {
    color: '#fff',
    fontSize: rMS(32),
    paddingBottom: 2,
  },
  definedValuesContainer: {
    height: 'auto',
    paddingHorizontal: rMS(14),
    paddingVertical: rMS(10),
    justifyContent: 'flex-start',
  },
  definedValuesText: {
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#292929',
    marginTop: rMS(0),
  },
  definedValuesRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 0,
  },
  definedValueItem: {
    width: 'auto',
    height: 32,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#486732',
    borderRadius: 4,
  },
  definedValueText: {
    textAlign: 'center',
    paddingHorizontal: 4,
    color: '#486732',
  },
  definedValueSeparator: {
    height: '60%',
    width: 1,
    backgroundColor: '#486732',
    marginHorizontal: 4,
  },
  definedValueDeleteText: {
    fontSize: 16,
    color: '#486732',
    textAlign: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    alignSelf: 'center',
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: rMS(11),
  },
});

export default styles;
