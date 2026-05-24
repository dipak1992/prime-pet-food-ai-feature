import Image from 'next/image'
import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

type HeadingProps = ComponentPropsWithoutRef<'h1'>
type ParagraphProps = ComponentPropsWithoutRef<'p'>
type AnchorProps = ComponentPropsWithoutRef<'a'>
type ListProps = ComponentPropsWithoutRef<'ul'>
type ListItemProps = ComponentPropsWithoutRef<'li'>
type BlockquoteProps = ComponentPropsWithoutRef<'blockquote'>
type CodeProps = ComponentPropsWithoutRef<'code'>
type PreProps = ComponentPropsWithoutRef<'pre'>
type StrongProps = ComponentPropsWithoutRef<'strong'>
type ImgProps = ComponentPropsWithoutRef<'img'>

/**
 * Styled MDX components for blog posts.
 */
export const blogMDXComponents = {
  h1: ({ children, ...props }: HeadingProps) => (
    <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mt-12 mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: HeadingProps) => (
    <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mt-10 mb-4" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: HeadingProps) => (
    <h3 className="font-serif text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-50 mt-8 mb-3" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: ParagraphProps) => (
    <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 my-5" {...props}>
      {children}
    </p>
  ),
  a: ({ href, children, ...props }: AnchorProps) => {
    const isInternal = href?.startsWith('/') || href?.startsWith('#')
    if (isInternal) {
      return (
        <Link href={href ?? '#'} className="text-[#D97757] hover:text-[#C86646] underline underline-offset-4 font-medium">
          {children}
        </Link>
      )
    }
    return (
      <a href={href} target="_blank" rel="noreferrer" className="text-[#D97757] hover:text-[#C86646] underline underline-offset-4 font-medium" {...props}>
        {children}
      </a>
    )
  },
  ul: ({ children, ...props }: ListProps) => (
    <ul className="my-5 space-y-2 list-disc list-outside pl-6 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
    <ol className="my-5 space-y-2 list-decimal list-outside pl-6 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: ListItemProps) => <li className="pl-1" {...props}>{children}</li>,
  blockquote: ({ children, ...props }: BlockquoteProps) => (
    <blockquote className="my-8 border-l-4 border-[#D97757] pl-6 py-2 font-serif text-xl italic text-neutral-900 dark:text-neutral-50" {...props}>
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }: CodeProps) => (
    <code className="bg-neutral-100 dark:bg-neutral-800 text-[#D97757] px-1.5 py-0.5 rounded text-[0.9em] font-mono" {...props}>
      {children}
    </code>
  ),
  pre: ({ children, ...props }: PreProps) => (
    <pre className="my-6 bg-neutral-900 text-neutral-100 rounded-2xl p-5 overflow-x-auto text-sm font-mono leading-relaxed" {...props}>
      {children}
    </pre>
  ),
  hr: () => (
    <hr className="my-12 border-0 h-px bg-neutral-200 dark:bg-neutral-800" />
  ),
  img: ({ src, alt }: ImgProps) => (
    <span className="block my-8 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
      <Image
        src={typeof src === 'string' ? src : ''}
        alt={alt ?? ''}
        width={1200}
        height={675}
        className="w-full h-auto"
      />
    </span>
  ),
  strong: ({ children, ...props }: StrongProps) => (
    <strong className="font-semibold text-neutral-900 dark:text-neutral-100" {...props}>
      {children}
    </strong>
  ),
}
