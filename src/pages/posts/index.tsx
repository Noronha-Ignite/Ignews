import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';

import styles from './styles.module.scss';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

interface PostsProps {
  posts: Post[]
}

const Posts: React.FC<PostsProps> = ({ posts }) => {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          { posts.map(post => (
            <Link key={ post.slug } href={`/posts/${post.slug}`}>
              <a href="#">
                <time>{ post.updatedAt }</time>
                <strong>{ post.title }</strong>
                <p>{ post.excerpt }</p>
              </a>
            </Link>
          )) }
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'publication')
  ], {
    fetch: ['publication.title', 'publication.content'],
    pageSize: 100,
  });

  const posts: Post[] = response.results.map(post => ({
    slug: post.uid,
    title: RichText.asText(post.data.title),
    excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
    updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }));

  return {
    props: {
      posts
    },
    revalidate: 60 * 60 // 1 hour
  };
}

export default Posts;