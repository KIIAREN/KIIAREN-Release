/**
 * Domain Verification Actions
 *
 * Convex actions for operations that require external API calls.
 * Actions can make HTTP requests (unlike mutations/queries).
 */

import { v } from 'convex/values';
import { action } from './_generated/server';
import { api, internal } from './_generated/api';

/**
 * DNS TXT lookup response from Google DNS-over-HTTPS
 */
interface DnsResponse {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: Array<{ name: string; type: number }>;
  Answer?: Array<{
    name: string;
    type: number;
    TTL: number;
    data: string;
  }>;
}

/**
 * Perform DNS TXT lookup using Google DNS-over-HTTPS
 */
async function lookupDnsTxt(domain: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`,
      {
        headers: {
          Accept: 'application/dns-json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`DNS lookup failed: ${response.status}`);
    }

    const data: DnsResponse = await response.json();

    // No answer means no TXT records
    if (!data.Answer) {
      return [];
    }

    // Extract TXT record data (type 16 = TXT)
    return data.Answer
      .filter((a) => a.type === 16)
      .map((a) => {
        // DNS TXT records are often quoted, remove quotes
        return a.data.replace(/^"|"$/g, '').replace(/\\"/g, '"');
      });
  } catch (error) {
    console.error('DNS lookup error:', error);
    return [];
  }
}

/**
 * Verify domain ownership via DNS TXT record
 *
 * Performs DNS lookup for:
 * _kiiaren-verification.{domain} TXT "kiiaren-verification={token}"
 */
export const verifyDomain = action({
  args: {
    domainId: v.id('domains'),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    // Get domain record
    const domain = await ctx.runQuery(api.domains.getById, {
      domainId: args.domainId,
    });

    if (!domain) {
      return { success: false, error: 'Domain not found' };
    }

    // Construct DNS lookup name
    const dnsName = `_kiiaren-verification.${domain.domain}`;
    const expectedValue = `kiiaren-verification=${domain.verificationToken}`;

    // Perform DNS lookup
    const txtRecords = await lookupDnsTxt(dnsName);

    // Check if any TXT record matches
    const isVerified = txtRecords.some(
      (record) => record.trim() === expectedValue
    );

    if (isVerified) {
      // Update domain status to verified
      await ctx.runMutation(internal.domains.updateStatus, {
        domainId: args.domainId,
        status: 'verified',
        verifiedAt: Date.now(),
      });

      return { success: true };
    }

    // Verification failed
    await ctx.runMutation(internal.domains.updateStatus, {
      domainId: args.domainId,
      status: 'failed',
    });

    // Provide helpful error message
    if (txtRecords.length === 0) {
      return {
        success: false,
        error: `No TXT records found at ${dnsName}. Please add the DNS record and wait for propagation (usually 5-15 minutes).`,
      };
    }

    return {
      success: false,
      error: `TXT records found at ${dnsName} but none match the expected value. Found: ${txtRecords.join(', ')}`,
    };
  },
});
