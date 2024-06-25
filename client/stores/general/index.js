import { create } from 'zustand';

export const useGeneralStore = create(set => ({
  createQuarantineModal: {
    step: 0,
    setStep: step => set(state => ({ createQuarantineModal: { ...state.createQuarantineModal, step } })),
    type: null,
    setType: type => set(state => ({ createQuarantineModal: { ...state.createQuarantineModal, type } })),
    value: '',
    setValue: value => set(state => ({ createQuarantineModal: { ...state.createQuarantineModal, value } })),
    restriction: null,
    setRestriction: restriction => set(state => ({ createQuarantineModal: { ...state.createQuarantineModal, restriction } })),
    reason: '',
    setReason: reason => set(state => ({ createQuarantineModal: { ...state.createQuarantineModal, reason } })),
    time: '',
    setTime: time => set(state => ({ createQuarantineModal: { ...state.createQuarantineModal, time } }))
  }
}));

export default useGeneralStore;