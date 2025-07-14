import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, Form, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  BlockStack,
  Text,
  TextField,
  ButtonGroup,
} from "@shopify/polaris";
import { shopify } from "../shopify.server";
import { useEffect, useState } from "react";

type ConnectResponse = { url: string } | { error: string };

/**
 * LOADER: Fetches the initial setup status from the Spring Boot backend.
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  await shopify(context).authenticate.admin(request);

  // Static response, adjust as needed to reflect real Stripe setup state
  return json({
    isSetupComplete: false,
    stripeId: null,
  });
}

/**
 * ACTION: Handles all form submissions on this page based on an "intent".
 */
export async function action({ request, context }: ActionFunctionArgs) {
  const { session } = await shopify(context).authenticate.admin(request);
  const { shop } = session;

  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create_connect_link": {
      const backendUrl = `http://104.198.2.248:8080/shezaar/stripe/onboarding-link?shop=${shop}`;
      try {
        const response = await fetch(backendUrl);

        if (!response.ok) {
          console.error("Failed to fetch onboarding link:", await response.text());
          return json({ error: "Backend responded with an error." }, { status: 500 });
        }

        const data:any = await response.json();
        if (!data.url || typeof data.url !== "string") {
          console.error("Invalid response from backend:", data);
          return json({ error: "Invalid onboarding link response." }, { status: 500 });
        }

        return json({ url: data.url });
      } catch (error) {
        console.error("Error connecting to backend:", error);
        return json({ error: "Could not connect to backend." }, { status: 500 });
      }
    }

    // case "save_manual_id": {
    //   const stripeId = formData.get("stripeId");
    //   if (typeof stripeId !== "string" || !stripeId.trim().startsWith("acct_")) {
    //     return json({ error: "Invalid Stripe ID provided." }, { status: 400 });
    //   }

    //   const saveUrl = `http://localhost:8080/api/setup/save-stripe-id?shop=${shop}`;
    //   try {
    //     const response = await fetch(saveUrl, {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({ stripeId }),
    //     });

    //     if (!response.ok) {
    //       console.error("Failed to save Stripe ID:", await response.text());
    //       return json({ error: "Failed to save Stripe ID." }, { status: 500 });
    //     }

    //     return json({ success: true });
    //   } catch (error) {
    //     console.error("Error saving Stripe ID:", error);
    //     return json({ error: "Could not connect to backend to save Stripe ID." }, { status: 500 });
    //   }
    // }

    default:
      return json({ error: "Invalid intent" }, { status: 400 });
  }
}

/**
 * The main React component for the page.
 */
export default function Index() {
  const { isSetupComplete, stripeId } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ConnectResponse>();
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);

  const handleConnectWithStripe = () => {
    const formData = new FormData();
    formData.append("intent", "create_connect_link");
    fetcher.submit(formData, { method: "post" });
  };

  useEffect(() => {
    if (fetcher.data && "url" in fetcher.data) {
      setStripeUrl(fetcher.data.url);
    }
  }, [fetcher.data]);

  if (isSetupComplete) {
    return (
      <Page>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                App is Ready!
              </Text>
              <Text as="dd">
                Your Stripe Account ({stripeId}) is connected.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Page>
    );
  }

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              {/* Option 1: Connect with Stripe */}
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  Connect a Stripe account
                </Text>
                {/* <Text as="dd">This is the recommended method.</Text> */}
                <Button variant="primary" size="large" onClick={handleConnectWithStripe}>
                  Generate Stripe Onboarding Link
                </Button>

                {stripeUrl && (
                  <div style={{ marginTop: "1rem" }}>
                    <Text as={"dd"}>Click below to open Stripe onboarding:</Text>
                    <a
                      href={stripeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#007bff",
                        textDecoration: "underline",
                        display: "block",
                        marginTop: "0.5rem",
                      }}
                    >
                      Go to Stripe Connect
                    </a>
                  </div>
                )}
              </BlockStack>

              {/* Option 2: Manually enter Stripe ID */}
              {/* <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  Option 2: Manually enter your existing Stripe ID
                </Text>
                <Form method="post">
                  <input type="hidden" name="intent" value="save_manual_id" />
                  <TextField
                    label="Your Stripe Account ID"
                    name="stripeId"
                    autoComplete="off"
                    placeholder="acct_..."
                  />
                  <ButtonGroup>
                    <Button submit>Save Stripe ID</Button>
                  </ButtonGroup>
                </Form>
              </BlockStack> */}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
