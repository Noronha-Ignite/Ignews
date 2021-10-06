import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/client";
import { RichText } from "prismic-dom";

import styles from './styles.module.scss';

import { getPrismicClient } from "../../../services/prismic";

interface Post {
  slug: string,
  title: string,
  content: string,
  updatedAt: string
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post} >
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>

          <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const session = await getSession({ req });
  const { slug } = params as { slug: string };

  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: `/posts/preview/${slug}`,
        permanent: false
      }
    }
  }

  const prismic = getPrismicClient(req);

  const response = await prismic.getByUID('publication', slug, {});

  const post: Post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  };

  return {
    props: {
      post
    }
  }
};