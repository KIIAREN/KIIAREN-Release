import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';

const deployment = process.env.CONVEX_DEPLOYMENT || "";
const isProd = deployment.includes("notable-mouse");

if (isProd) {
  process.env.SITE_URL = "https://auth.kiiaren.com";
}

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
