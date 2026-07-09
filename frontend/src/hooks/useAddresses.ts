import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/auth';
import { addressesService } from '../services/addresses.service';
import type { Address, AddressDTO } from '../services/addresses.service';

export const useAddresses = () => {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<Address[], Error>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No autenticado');
      return addressesService.getMine(token);
    },
    enabled: Boolean(isSignedIn),
  });
};

export const useCreateAddress = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Address, Error, AddressDTO>({
    mutationFn: async (data) => {
      const token = await getToken();
      if (!token) throw new Error('No autenticado');
      return addressesService.create(data, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
};

export const useDeleteAddress = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken();
      if (!token) throw new Error('No autenticado');
      return addressesService.delete(id, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
};
