"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  paymentsApi,
  type ServiceRequestFilters,
  serviceRequestsApi,
} from "@/api";
import { queryKeys } from "./query-keys";

export const useMyServiceRequests = (filters: ServiceRequestFilters = {}) =>
  useQuery({
    queryKey: queryKeys.serviceRequests.mine(filters),
    queryFn: () => serviceRequestsApi.listMine(filters),
    placeholderData: (previous) => previous,
  });

export const useServiceRequest = (id: string) =>
  useQuery({
    queryKey: queryKeys.serviceRequests.detail(id),
    queryFn: () => serviceRequestsApi.getById(id),
    enabled: Boolean(id),
  });

export const useCreateServiceRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serviceRequestsApi.create,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.serviceRequests.all,
      }),
  });
};

export const useUploadServiceDocument = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, label }: { file: File; label: string }) =>
      serviceRequestsApi.addDocument(id, file, label),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.serviceRequests.detail(id),
      }),
  });
};

/**
 * Initiating a payment is a redirect, not a state change: the browser leaves for
 * the gateway, so there is nothing to invalidate on this side.
 */
export const useInitiatePayment = () =>
  useMutation({ mutationFn: paymentsApi.initiate });

export const useMyPayments = (page = 1, limit = 10) =>
  useQuery({
    queryKey: queryKeys.payments.mine(page, limit),
    queryFn: () => paymentsApi.listMine({ page, limit }),
    placeholderData: (previous) => previous,
  });
