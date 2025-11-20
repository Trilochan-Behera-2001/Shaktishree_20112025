import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userProfileName } from '../services/AuthService';
import { useSelector } from 'react-redux';
import { getJwtToken, removeJwtToken } from '../utils/cookieUtils';

export const useUserProfile = () => {
  const queryClient = useQueryClient();
  const reduxToken = useSelector((state) => state.auth.token); 

  const cookieToken = getJwtToken();
  const token = reduxToken || cookieToken;

  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      if (!token) throw new Error('No token available');
      const res = await userProfileName();
      return res.data; 
    },
    enabled: !!token,               
    staleTime: 1000 * 60 * 5, 
    cacheTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,    
    refetchOnMount: false,       
    refetchOnReconnect: false,    
    onError: () => {
      queryClient.removeQueries(['userProfile']);
      removeJwtToken();
    },
  });
};