import { apiGet, apiPost, apiPut, apiDelete } from '../client';

export const ratingsEndpoints = {
    list: async () => {
        const res = await apiGet('/ratings');
        return res.data;
    },

    getByDoctor: async (doctorId: string) => {
        const res = await apiGet(`/ratings/doctor/${doctorId}`);
        return res.data;
    },

    getByPatient: async (patientId: string) => {
        const res = await apiGet(`/ratings/patient/${patientId}`);
        return res.data;
    },

    create: async (data: { doctorId: string; rating: number; comment: string }) => {
        const res = await apiPost('/ratings', data);
        return res.data;
    },

    update: async (id: string, data: { doctorId: string; rating: number; comment: string }) => {
        const res = await apiPut(`/ratings/${id}`, data);
        return res.data;
    },

    delete: async (id: string) => {
        const res = await apiDelete(`/ratings/${id}`);
        return res.data;
    }
};
