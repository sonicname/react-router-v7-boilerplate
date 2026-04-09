import { defineApi } from 'react-router-define-api';

export const { loader } = defineApi()
  .get(async () => {
    return {
      status: 'ok',
    };
  })
  .build();
