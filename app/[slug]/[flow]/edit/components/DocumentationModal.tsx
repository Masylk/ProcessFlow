import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useColors } from '@/app/theme/hooks';
import DynamicIcon from '@/utils/DynamicIcon';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';

interface Tab {
  id: string;
  icon: string;
  label: string;
  content: {
    title: string;
    description: string;
    image?: string;
    bullets?: string[];
  }[];
}

interface DocumentationModalProps {
  onClose: () => void;
}

const tabs: Tab[] = [
  {
    id: 'step',
    icon: 'git-commit',
    label: 'Step',
    content: [
      {
        title: 'Step Block',
        description: 'The Step Block is the fundamental building block of any Flow. It represents a single action, task, or stage in your process and provides detailed information to help users understand exactly what needs to be done.',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-commit.svg`
      },
      {
        title: 'When to use',
        description: '',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/help-circle.svg`,
        bullets: [
          'To break down complex processes into understandable segments',
          'When users need clear guidance with visual support',
          'As the primary building blocks of straightforward, linear processes'
        ]
      },
      {
        title: 'How to add',
        description: '',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-circle.svg`,
        bullets: [
          'Click on the "+" to add a new step to your flow',
          'Select the "Step"'
        ]
      }
    ]
  },
  {
    id: 'delay',
    icon: 'clock-stopwatch',
    label: 'Delay',
    content: [
      {
        title: 'Delay Block',
        description: 'The Delay Block allows you to introduce waiting periods into your Flow. This is essential for modeling real-world scenarios where tasks may require waiting for specific durations or external events before proceeding.',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock-stopwatch.svg`
      },
      {
        title: 'Fixed Duration Delay',
        description: 'A strict waiting period that must be fully completed before the process can continue.',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock-stopwatch.svg`,
        bullets: [
          'Mandatory waiting periods (e.g., "Wait 24 hours for the solution to set")',
          'Regulatory holding periods (e.g., "Wait 7 days before processing the refund")'
        ]
      },
      {
        title: 'Wait For Event',
        description: 'A flexible waiting period that concludes when either an external event occurs or a maximum time limit is reached.',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/calendar-date.svg`,
        bullets: [
          'Client responses (e.g., "Wait for client feedback for up to 3 days")',
          'Approval workflows (e.g., "Wait for manager approval within 48 hours")',
          'Conditional actions (e.g., "Wait for payment confirmation for up to 7 days")'
        ]
      },
      {
        title: 'How to add',
        description: '',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-circle.svg`,
        bullets: [
          'Click on the "+" to add a new step to your flow',
          'Select the delay block',
          'Setup your delay block'
        ]
      }
    ]
  },
  {
    id: 'link',
    icon: 'connect-node',
    label: 'Link',
    content: [
      {
        title: 'Link Block',
        description: 'The Link allows you to create connections between blocks that don\'t follow the standard top-to-bottom flow. This is essential for representing complex processes that include cycles, loops, decision points with returns to previous steps, or any non-linear flow.',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/connect-node.svg`
      },
      {
        title: 'When to use',
        description: '',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/help-circle.svg`,
        bullets: [
          'To create loops (e.g., "If document needs revision, return to Step 2")',
          'To represent conditional returns to earlier steps (e.g., "If application is incomplete, return to data collection")',
          'When a process requires jumping between different sections based on specific conditions',
          'To simplify complex workflows by avoiding redundant steps'
        ]
      },
      {
        title: 'How to add',
        description: '',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal.svg`,
        bullets: [
          'Click on the three dot on a step block, it will open a menu.',
          'Select "connect blocks"',
          'Click on the source block (where the link starts)',
          'Click on the target block (where the link ends)',
          'Add an optional label to describe the purpose of the connection'
        ]
      }
    ]
  },
  {
    id: 'condition',
    icon: 'dataflow-04',
    label: 'Condition',
    content: [
      {
        title: 'Conditional Path',
        description: 'The Conditional Path functionality enables you to create multiple alternative paths in your workflow based on different scenarios, decisions, or conditions. This powerful feature allows your processes to adapt to varying circumstances, making them more flexible and realistic.',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dataflow-04.svg`
      },
      {
        title: 'When to use',
        description: '',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/help-circle.svg`,
        bullets: [
          'When a process can take different routes based on specific criteria',
          'For approval workflows with "approved" and "rejected" outcomes',
          'When representing decision trees with multiple possible answers',
          'When documenting exception handling in standard procedures',
          'For compliance documentation that covers multiple scenarios'
        ]
      },
      {
        title: 'How to add',
        description: '',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-circle.svg`,
        bullets: [
          'Click on the "+" to add a new step to your flow',
          'Select the "Condition"'
        ]
      }
    ]
  },
  {
    id: 'merge',
    icon: 'git-merge',
    label: 'Merge',
    content: [
      {
        title: 'Merge Paths',
        description: 'The Merge Paths allows you to unify multiple paths back into a single path, making it essential for workflows where different conditions or parallel processes eventually converge to a common next step. This creates cleaner, more maintainable processes by avoiding redundant blocks after decision points.',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-merge.svg`
      },
      {
        title: 'When to use',
        description: '',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/help-circle.svg`,
        bullets: [
          'After conditional paths that eventually lead to the same next steps',
          'When multiple approval or review paths converge to a common outcome',
          'To simplify workflow visualization by reducing redundant blocks'
        ]
      },
      {
        title: 'How to add',
        description: '',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal.svg`,
        bullets: [
          'Click on the three dot on a step block, it will open a menu.',
          'Select "Merge paths"',
          'Choose the paths you want to merge (it can only be the paths on the same path and at the same level).',
          'Click on "Merge Paths" once you\'ve choose your block to merge.'
        ]
      }
    ]
  },
  {
    id: 'path-labels',
    icon: 'text-input',
    label: 'Path Labels',
    content: [
      {
        title: 'Path Labels',
        description: 'Path Labels are descriptive text elements that identify the different options at decision points in your workflow. They appear on Conditional Paths and Link Lines, providing clear guidance to users when they need to make selections in Read Mode.',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/text-input.svg`
      },
      {
        title: 'When to use',
        description: '',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/help-circle.svg`,
        bullets: [
          'On all conditional paths to clearly distinguish between options',
          'When creating interactive processes where users select their own path',
          'When documenting decision trees with multiple options',
          'For any workflow where users need to make choices based on specific criteria'
        ]
      },
      {
        title: 'How to add',
        description: '',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`,
        bullets: [
          'Label are automatically added on path when needed',
          'You can always modify the text on it by clicking on the edit button'
        ]
      }
    ]
  },
  {
    id: 'end',
    icon: 'stop-circle',
    label: 'End',
    content: [
      {
        title: 'End Block',
        description: 'The End Block represents the final point of a process path. Unlike the Start block (which is automatically added to every workflow and cannot be deleted), End blocks are optional visual elements that help users clearly identify where specific paths terminate.',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/stop-circle.svg`
      },
      {
        title: 'When to use',
        description: '',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/help-circle.svg`,
        bullets: [
          'At the conclusion of every meaningful path in your workflow',
          'To mark different possible outcomes of a process (e.g., "Application Approved," "Application Rejected")',
          'When documenting process termination points for compliance or training purposes',
          'To make complex workflows with multiple branches easier to understand'
        ]
      },
      {
        title: 'How to add',
        description: '',
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-circle.svg`,
        bullets: [
          'Click on the "+" to add a new step to your flow',
          'Select the End block, which will only be visible if there are no steps below the current one.'
        ]
      }
    ]
  }
];

export function DocumentationModal({ onClose }: DocumentationModalProps) {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter tabs based on search query
  const filteredTabs = useMemo(() => {
    if (!searchQuery) return tabs;
    
    const query = searchQuery.toLowerCase();
    return tabs.filter(tab => {
      // Search in tab label
      if (tab.label.toLowerCase().includes(query)) return true;
      
      // Search in tab content
      return tab.content.some(content => 
        content.title.toLowerCase().includes(query) ||
        content.description.toLowerCase().includes(query) ||
        content.bullets?.some(bullet => bullet.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, tabs]);

  // Reset scroll position when active tab changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content || [];

  return (
    <>
      <div 
        className="fixed inset-0 flex items-center justify-center p-8"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0">
          <div 
            style={{ backgroundColor: colors['bg-overlay'] }}
            className="absolute inset-0 opacity-70" 
          />
        </div>

        <div 
          className="relative z-10 w-[900px] h-[600px] rounded-lg flex overflow-hidden shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] border border-white/10"
          style={{ 
            backgroundColor: colors['bg-primary'],
            boxShadow: `0 10px 50px -12px ${colors['accent-primary']}30`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left sidebar with tabs */}
          <div 
            className="w-[240px] h-full py-6 border-r flex flex-col"
            style={{ 
              backgroundColor: colors['bg-secondary'],
              borderColor: colors['border-primary'],
              borderRightWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            <div className="px-4 space-y-6">
              <h2 
                className="px-2 text-sm font-regular"
                style={{ color: colors['text-quaternary'] }}
              >
                Documentation
              </h2>
              <div className="px-0">
                <InputField
                  type="icon-leading"
                  size="small"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  iconUrl={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-icon.svg`}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col space-y-1 flex-1 overflow-y-auto custom-scrollbar px-2">
              {filteredTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`flex items-center gap-3 mx-2 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'shadow-sm' 
                      : 'hover:bg-white/[0.02]'
                  }`}
                  style={{ 
                    color: activeTab === tab.id ? colors['text-primary'] : colors['text-secondary'],
                    backgroundColor: activeTab === tab.id ? colors['bg-tertiary'] : 'transparent',
                    transform: activeTab === tab.id ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <DynamicIcon
                    url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${tab.icon}.svg`}
                    size={18}
                    variant={activeTab === tab.id ? 'primary' : 'tertiary'}
                  />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right content area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div 
              className="px-6 py-6 border-b flex items-center justify-between"
              style={{ borderColor: colors['border-primary'] }}
            >
              <div>
                <h1 
                  className="text-lg font-semibold mb-1.5"
                  style={{ color: colors['text-primary'] }}
                >
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h1>
                <p 
                  className="text-sm"
                  style={{ color: colors['text-secondary'] }}
                >
                  Learn how to use {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} blocks in your workflow
                </p>
              </div>
              <ButtonNormal
                leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/x-close-icon.svg`}
                iconOnly={true}
                variant="tertiary"
                onClick={onClose}
              />
            </div>

            {/* Content */}
            <div 
              ref={contentRef}
              className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar"
              style={{
                scrollbarGutter: 'stable',
              }}
            >
              <div className="flex flex-col gap-4 pb-4">
                {activeTabContent.map((content, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-2xl border"
                    style={{ 
                      backgroundColor: colors['bg-secondary'],
                      borderColor: colors['border-primary']
                    }}
                  >
                    <div className="flex items-start gap-5">
                      {content.image && (
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: colors['bg-tertiary'] }}
                        >
                          <DynamicIcon
                            url={content.image}
                            size={20}
                            variant="primary"
                          />
                        </div>
                      )}
                      <div className="flex flex-col gap-3 min-w-0">
                        <h3 
                          className="text-[15px] font-semibold"
                          style={{ color: colors['text-primary'] }}
                        >
                          {content.title}
                        </h3>
                        {content.description && (
                          <p 
                            className="text-sm leading-relaxed"
                            style={{ color: colors['text-secondary'] }}
                          >
                            {content.description}
                          </p>
                        )}
                        {content.bullets && content.bullets.length > 0 && (
                          <ul className="flex flex-col gap-2.5 mt-1">
                            {content.bullets.map((bullet, i) => (
                              <li 
                                key={i} 
                                className="flex items-start gap-3 text-sm leading-relaxed"
                                style={{ color: colors['text-secondary'] }}
                              >
                                <span 
                                  className="mt-[7px] w-1 h-1 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: colors['text-secondary'] }}
                                />
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${colors['border-primary']};
            border-radius: 10px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${colors['border-secondary']};
          }

          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </>
  );
} 