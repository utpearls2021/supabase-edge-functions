// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "supabase";
import Stripe from "stripe";

console.log("Hello from Functions!");

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
);

const stripeClient = new Stripe(Deno.env.get("STRIPE_SECRET") as string, {
  apiVersion: "2023-08-16",
});

Deno.serve(async (req) => {
  const { name } = await req.json();
  const data = {
    message: `Hello ${name}!`,
  };

  const createCustomer = (
    data: Stripe.CustomerCreateParams,
  ): Promise<Stripe.Response<Stripe.Customer>> => {
    return stripeClient.customers.create(data);
  };

  const customerResult = await createCustomer({
    name: "utdev from supabase 2",
  });

  console.log("customerResult", customerResult);

  let { data: admins, error } = await supabaseClient.from("admins").select("*");

  // console.log("admins 45678", admins);

  return new Response(
    JSON.stringify({
      data,
      customerResult,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/hello-world' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
