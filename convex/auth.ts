import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';

// KIIAREN-Release is for self-hosted deployments only
// Production SaaS deployment (kiiaren.com) uses KIIAREN-SAAS repository
// This file should not contain production/SaaS-specific logic

import { DataModel } from './_generated/dataModel';

const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string,
    };
  },
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [CustomPassword, GitHub, Google],
});
