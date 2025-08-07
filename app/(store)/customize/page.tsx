import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const userAgent = req.headers["user-agent"] || "";
  const isMobile = /mobile/i.test(userAgent);

  return {
    redirect: {
      destination: isMobile ? "/customize/mobile" : "/customize/desktop",
      permanent: false,
    },
  };
};

export default function DesignPage() {
  return null;
}
