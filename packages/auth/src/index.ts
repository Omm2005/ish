

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@ish/env/server";
import { db } from "@ish/db";
import * as schema from "@ish/db/schema/auth";
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
provider: "pg",


		schema: schema,
	}),
	trustedOrigins: [
		env.CORS_ORIGIN,
		"ish://",
		...(env.NODE_ENV === "development"
			? [
				"exp://",
				"exp://**",
				"exp://192.168.*.*:*/**",
				"http://localhost:8081",
			]
			: []),
	],
	// uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
	// session: {
	//   cookieCache: {
	//     enabled: true,
	//     maxAge: 60,
	//   },
	// },
    socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      prompt: 'select_account',
    },
  },
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
		// uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
		// https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
		// crossSubDomainCookies: {
		//   enabled: true,
		//   domain: "<your-workers-subdomain>",
		// },
	},
    plugins: [expo()]
});

