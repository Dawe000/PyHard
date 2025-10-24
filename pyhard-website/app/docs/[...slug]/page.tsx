import React from 'react';
import { notFound } from 'next/navigation';
import { DocsLayout } from '@/components/DocsLayout';
import { CodeBlock } from '@/components/CodeBlock';
import { CheckCircle2, ArrowRight, ExternalLink, Copy, Monitor, Box, Code, Zap } from 'lucide-react';
import docsData from '@/data/docs.json';

interface DocsPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

const iconMap = {
  monitor: Monitor,
  cube: Box,
  code: Code,
  zap: Zap,
};

export default async function DocsPage({ params }: DocsPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug?.join('/') || 'overview';
  const docData = docsData[slug as keyof typeof docsData];

  if (!docData) {
    notFound();
  }

  const renderContent = (content: any) => {
    return content.map((item: any, index: number) => {
      switch (item.type) {
        case 'hero':
          const IconComponent = iconMap[item.icon as keyof typeof iconMap];
          return (
            <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 backdrop-blur-sm hover:border-white/30 transition-colors">
              <div className="flex items-start space-x-4">
                {IconComponent && (
                  <div className="w-12 h-12 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 mb-4">{item.description}</p>
                  <a
                    href={item.link}
                    className="inline-flex items-center text-pyhard-blue hover:text-pyhard-accent transition-colors"
                  >
                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          );

        case 'section':
          return (
            <section key={index} className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-6">{item.title}</h2>
              {item.description && (
                <p className="text-gray-400 mb-6">{item.description}</p>
              )}
              {item.content && renderContent(item.content)}
              {item.code && (
                <CodeBlock
                  code={item.code.code}
                  language={item.code.language}
                />
              )}
            </section>
          );

        case 'component':
          return (
            <div key={index} className="mb-12">
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-2">{item.name}</h3>
                <p className="text-gray-400 mb-6">{item.description}</p>
                
                {item.props && item.props.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-white mb-4">Props</h4>
                    <div className="space-y-3">
                      {item.props.map((prop: any, propIndex: number) => (
                        <div key={propIndex} className="bg-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <code className="bg-gray-700 px-2 py-1 rounded text-sm text-pyhard-blue">
                              {prop.name}
                            </code>
                            <span className="text-gray-400 text-sm">{prop.type}</span>
                            {prop.default && (
                              <span className="text-gray-500 text-sm">default: {prop.default}</span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm">{prop.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.example && (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Example</h4>
                    <CodeBlock
                      code={item.example.code}
                      language={item.example.language}
                    />
                  </div>
                )}
              </div>
            </div>
          );

        case 'hook':
          return (
            <div key={index} className="mb-12">
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-2">{item.name}</h3>
                <p className="text-gray-400 mb-6">{item.description}</p>
                
                {item.params && item.params.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-white mb-4">Parameters</h4>
                    <div className="space-y-3">
                      {item.params.map((param: any, paramIndex: number) => (
                        <div key={paramIndex} className="bg-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <code className="bg-gray-700 px-2 py-1 rounded text-sm text-pyhard-blue">
                              {param.name}
                            </code>
                            <span className="text-gray-400 text-sm">{param.type}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.returns && item.returns.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-white mb-4">Returns</h4>
                    <div className="space-y-3">
                      {item.returns.map((ret: any, retIndex: number) => (
                        <div key={retIndex} className="bg-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <code className="bg-gray-700 px-2 py-1 rounded text-sm text-pyhard-blue">
                              {ret.name}
                            </code>
                            <span className="text-gray-400 text-sm">{ret.type}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{ret.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.example && (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Example</h4>
                    <CodeBlock
                      code={item.example.code}
                      language={item.example.language}
                    />
                  </div>
                )}
              </div>
            </div>
          );

        case 'code':
          return (
            <div key={index} className="mb-6">
              <CodeBlock
                code={item.code}
                language={item.language}
              />
            </div>
          );

        case 'text':
          return (
            <p key={index} className="text-gray-300 mb-4">{item.content}</p>
          );

        default:
          return null;
      }
    });
  };

  return (
    <DocsLayout 
      title={docData.title} 
      description={docData.description}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderContent(docData.content)}
      </div>
    </DocsLayout>
  );
}
