export class ShopifyAdmin {
  constructor({ storeDomain, accessToken, apiVersion = '2026-04' }) {
    this.storeDomain = normalizeStoreDomain(storeDomain);
    this.accessToken = accessToken;
    this.apiVersion = apiVersion;
    this.endpoint = `https://${this.storeDomain}/admin/api/${this.apiVersion}/graphql.json`;
  }

  async graphql(query, variables = {}) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`Shopify GraphQL HTTP ${response.status}: ${JSON.stringify(payload)}`);
    }
    if (payload?.errors?.length) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(payload.errors)}`);
    }
    return payload.data;
  }

  async findBlogByHandle(handle) {
    const data = await this.graphql(
      `query FindBlog($query: String!) {
        blogs(first: 1, query: $query) {
          nodes {
            id
            title
            handle
          }
        }
      }`,
      { query: `handle:${handle}` },
    );
    return data.blogs.nodes[0] ?? null;
  }

  async createBlog({ title, handle, templateSuffix = null, commentPolicy = 'MODERATED' }) {
    const blog = cleanObject({ title, handle, templateSuffix, commentPolicy });
    const data = await this.graphql(
      `mutation CreateBlog($blog: BlogCreateInput!) {
        blogCreate(blog: $blog) {
          blog {
            id
            title
            handle
          }
          userErrors {
            code
            field
            message
          }
        }
      }`,
      { blog },
    );
    assertNoUserErrors(data.blogCreate.userErrors, 'blogCreate');
    return data.blogCreate.blog;
  }

  async findArticleByHandle({ blogHandle, handle }) {
    const data = await this.graphql(
      `query FindArticle($query: String!) {
        articles(first: 10, query: $query) {
          nodes {
            id
            title
            handle
            publishedAt
            blog {
              id
              title
              handle
            }
          }
        }
      }`,
      { query: `handle:${handle}` },
    );
    return data.articles.nodes.find((article) => article.blog.handle === blogHandle) ?? null;
  }

  async createArticle(article) {
    const data = await this.graphql(
      `mutation CreateArticle($article: ArticleCreateInput!) {
        articleCreate(article: $article) {
          article {
            id
            title
            handle
            blog {
              handle
            }
          }
          userErrors {
            code
            field
            message
          }
        }
      }`,
      { article },
    );
    assertNoUserErrors(data.articleCreate.userErrors, 'articleCreate');
    return data.articleCreate.article;
  }

  async updateArticle(id, article) {
    const data = await this.graphql(
      `mutation UpdateArticle($id: ID!, $article: ArticleUpdateInput!) {
        articleUpdate(id: $id, article: $article) {
          article {
            id
            title
            handle
            blog {
              handle
            }
          }
          userErrors {
            code
            field
            message
          }
        }
      }`,
      { id, article },
    );
    assertNoUserErrors(data.articleUpdate.userErrors, 'articleUpdate');
    return data.articleUpdate.article;
  }
}

export function buildArticleInput(article, blogId) {
  return cleanObject({
    blogId,
    title: article.title,
    handle: article.handle,
    body: article.bodyHtml,
    summary: article.summaryHtml,
    author: article.author ? { name: article.author } : undefined,
    isPublished: article.published,
    publishDate: article.publishDate,
    tags: article.tags,
    templateSuffix: article.templateSuffix,
    image: article.imageUrl
      ? {
          url: article.imageUrl,
          altText: article.imageAlt || article.title,
        }
      : undefined,
  });
}

function normalizeStoreDomain(value) {
  return value.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

function assertNoUserErrors(errors, operation) {
  if (errors?.length) {
    const message = errors.map((error) => `${error.field?.join('.') || 'field'}: ${error.message}`).join('; ');
    throw new Error(`${operation} failed: ${message}`);
  }
}

function cleanObject(input) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

