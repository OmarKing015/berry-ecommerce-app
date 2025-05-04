# Berry Ecommerce Application 🛒

The Berry Ecommerce Application is a robust Next.js-based platform designed for online retail. It integrates seamlessly with Sanity for content management, Clerk for user authentication, Stripe for secure payment processing. This README provides detailed instructions to set up, configure, and customize the application.

## 🔗 Preview

## ![Dashboard Preview](/public/preview_image.png)

🌍 Live Demo - https://berry.reactbd.com/

---

## Prerequisites ✅

Ensure the following are installed before proceeding:

- Node.js (version 18 or later)
- npm, yarn, or pnpm (based on your preference)
- A code editor (e.g., Visual Studio Code)
- Accounts with Sanity, Clerk and Stripe (credentials setup detailed below)

## Installation and Setup ⚙️

Follow these steps to configure the Berry Ecommerce Application:

### 1. Install Dependencies

Install the necessary npm packages to prepare the project environment.
Choose your package manager and run one of the following commands:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

This command fetches all dependencies specified in package.json.

## 2. Create a Sanity Project 🛠️

Set up a Sanity project to manage your ecommerce content, such as products and blog posts.
Run the following command:

```bash
npm create sanity@latest -- --env=.env.local --create-project "Berry Ecommerce" --dataset production
```

### Instructions:

If you don’t have a Sanity account, follow the prompts to create one.

- When prompted with "Would you like to add configuration files for a Sanity project in this Next.js folder?", select "n" (no), as the --env=.env.local flag handles configuration.
- This command creates or updates a .env.local file with:
- NEXT_PUBLIC_SANITY_PROJECT_ID: A unique identifier for your Sanity project.
- NEXT_PUBLIC_SANITY_DATASET: Set to production.

### Verification:

Visit Sanity Manage.
Select the "Berry Ecommerce" project to confirm the NEXT_PUBLIC_SANITY_PROJECT_ID.

- Note: You can verify your NEXT_PUBLIC_SANITY_PROJECT_ID later by logging into https://www.sanity.io/manage, selecting the "Berry ecommerce" project, and checking the project details.

## 3. Set Up Environment Variables 🔑

The application requires environment variables to connect to external services. Create or update the .env or .env.local file in the project root with the following:

```bash

NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SANITY_PROJECT_ID=<already-set-by-step-2>
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-09
SANITY_API_TOKEN=<your-sanity-api-token>
SANITY_API_READ_TOKEN=<your-sanity-api-read-token>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>

```

### Obtaining Credentials:

#### Sanity Variables:

- SANITY_API_TOKEN and SANITY_API_READ_TOKEN:
- Go to Sanity Manage.
- Select the "Berry Ecommerce" project.
- Navigate to the API section.
- Click Add API token to generate tokens:
- "Editor" for write access (SANITY_API_TOKEN).
- "Viewer" for read access (SANITY_API_READ_TOKEN).
- Add the tokens to .env or .env.local.

#### Clerk Variables:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY:

- Sign up at Clerk.
- Create an application.
- Copy the keys from the Clerk dashboard.

#### Stripe Variables:

STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET:

- Register at Stripe.
- Create an account.
- Retrieve the keys from the Stripe dashboard.

### Notes:

NEXT_PUBLIC_BASE_URL: Set to http://localhost:3000 for local development.
You can check the production URL (https://Berry.reactbd.com/) for demo purposes.

### ⚠️ Alert:

Do not commit .env.local to version control, as it contains sensitive data. Next.js automatically excludes it via .gitignore.

## 4. (Optional) Import Demo Seed Data 📚 for Purchased version only

## Purchased from (https://buymeacoffee.com/reactbd/e/344052)

Populate your Sanity project with sample data (e.g., products or blog posts) by running:

```bash
npx sanity@latest dataset import seed.tar.gz
```

#### Notes:

This step is optional and requires a seed.tar.gz file, which may be included with the template.
Place the seed.tar.gz file in the project root before executing the command.

## 5. Start the Development Server 🚀

Launch the Next.js development server to run the application locally.
Run one of the following commands:

```bash

# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev

```

## 6. Access the Application 🌐

Once the server is running, access the application at:

- Visit http://localhost:3000 in your browser to see the ecommerce website.
- Go to http://localhost:3000/admin/studio to access the Sanity Studio and manage your content.

## Customization 🎨

To adapt the application to your requirements:

Modify Source Code:
Edit files in the /app and /components directories to customize the frontend and functionality.
Next.js’s hot reloading instantly reflects changes in the browser.

Sanity Studio:
Use the Sanity Studio to manage content like products, categories, or blog posts.
Customize schemas in the Sanity project to align with your data structure.

## Security Considerations 🔒

Environment Variables:
Keep .env.local secure and avoid exposing sensitive keys (e.g., API tokens, secret keys).

Version Control:
Verify .env.local is included in .gitignore to prevent accidental commits.

Production Deployment:
Update NEXT_PUBLIC_BASE_URL and revalidate all credentials before deploying to a live environment.

## License 📜

The Berry Ecommerce Application is a commercial product licensed under ReactBD Technologies.

## Support 📩

For questions or assistance, contact the ReactBD Technologies support team.

# Learn More 📖

Dive into the technologies used in this application:

- Tailwind CSS - Utility-first CSS framework for styling [ https://tailwindcss.com/ ]
- @clerk/nextjs - Clerk’s Next.js integration for authentication and user management [ https://clerk.com/docs ]
- @headlessui/react - Unstyled, accessible UI components for React [ https://headlessui.com/ ]
- @radix-ui - Accessible component from Radix UI [ https://www.radix-ui.com/ ]
- @sanity/client - JavaScript client for interacting with Sanity APIs [ https://www.sanity.io/docs/client-libraries ]
- @sanity/icons - Icon library for Sanity projects [ https://www.sanity.io/plugins/icons ]
- @sanity/image-url - Utility for generating image URLs from Sanity assets [ https://www.sanity.io/docs/image-url ]
- @sanity/preview-url-secret - Utility for secure preview URLs in Sanity [ https://www.sanity.io/docs/preview-url-secret ]
- @sanity/vision - Debugging tool for Sanity queries [ https://www.sanity.io/plugins/vision ]
- @types/lodash - TypeScript definitions for Lodash [ https://www.npmjs.com/package/@types/lodash ]
- class-variance-authority - Utility for managing class variants in JavaScript/TypeScript [ https://cva.style/docs ]
- clsx - Utility for constructing className strings conditionally [ https://github.com/lukeed/clsx ]
- cmdk - Command menu component for React [ https://cmdk.paco.me/ ]
- date-fns - Modern JavaScript date utility library [ https://date-fns.org/docs ]
- dayjs - Lightweight date manipulation library [ https://day.js.org/docs ]
- embla-carousel-react - Extensible carousel library for React [ https://www.embla-carousel.com/ ]
- framer-motion - Animation library for React [ https://www.framer.com/motion/ ]
- install - Utility for installing npm packages [ https://www.npmjs.com/package/install ]
- lodash - Utility library for JavaScript [ https://lodash.com/docs ]
- lucide-react - Beautiful & consistent icons for React [ https://lucide.dev/ ]
- motion - Alias for Framer Motion, an animation library for React [ https://www.framer.com/motion/ ]
- next - React framework for server-rendered applications [ https://nextjs.org/docs ]
- next-sanity - Toolkit for integrating Sanity with Next.js [ https://www.sanity.io/docs/nextjs ]
- react - JavaScript library for building user interfaces [ https://react.dev/ ]
- react-dom - DOM-specific methods for React [ https://react.dev/reference/react-dom ]
- react-hot-toast - Notifications library for React [ https://react-hot-toast.com/ ]
- react-icons - Popular icons in React [ https://react-icons.github.io/react-icons/ ]
- sanity - Content management platform [ https://www.sanity.io/docs ]
- stripe - Payment processing platform [ https://stripe.com/docs ]
- styled-components - CSS-in-JS styling solution [ https://styled-components.com/docs ]
- tailwind-merge - Utility for merging Tailwind CSS classes [ https://github.com/dcastil/tailwind-merge ]
- tailwindcss-animate - Animation utilities for Tailwind CSS [ https://github.com/jamiebuilds/tailwindcss-animate ]
- zustand - State management for React [ https://zustand-demo.pmnd.rs/ ]
