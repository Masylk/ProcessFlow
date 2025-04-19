'use client';

import { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import ButtonNormal from './ButtonNormal';
import InputField from './InputFields';
import { useColors } from '../theme/hooks';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName?: string;
  shareableLink?: string;
  params?: {
    id?: string;
    workflowId?: string;
  };
  is_public?: boolean;
  onToggleAccess?: () => void;
  shareUrl?: string;
  workspaceLogo?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  itemName = 'item',
  shareableLink = window.location.href,
  params,
  is_public = false,
  onToggleAccess,
  shareUrl,
  workspaceLogo,
}: ShareModalProps) {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState('share');
  const [inputValue, setInputValue] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('can view');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openPersonDropdownIndex, setOpenPersonDropdownIndex] = useState<
    number | null
  >(null);
  const [openTeamDropdownIndex, setOpenTeamDropdownIndex] = useState<
    number | null
  >(null);
  const [showToast, setShowToast] = useState(false);
  const [visibilityOption, setVisibilityOption] = useState(
    'Anyone with the link can view'
  );
  const [isVisibilityDropdownOpen, setIsVisibilityDropdownOpen] =
    useState(false);
  const [peopleWithAccess, setPeopleWithAccess] = useState([
    { name: 'JordanDesprès', permission: 'Full access' },
    { name: 'John Doe', permission: 'Editor' },
    { name: 'Marc Aston', permission: 'Reader' },
  ]);
  const [teamsWithAccess, setTeamsWithAccess] = useState([
    { name: 'Design', permission: 'Editor', color: 'blue' },
    { name: 'Human resources', permission: 'Reader', color: 'indigo' },
    { name: 'Marketing', permission: 'Editor', color: 'pink' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const peopleDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const teamDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const visibilityDropdownRef = useRef<HTMLDivElement>(null);

  const permissionOptions = ['can view', 'can edit', 'can comment'];
  const personPermissionOptions = ['Full access', 'Editor', 'Reader'];
  const visibilityOptions = [
    'Anyone with the link can view',
    'Anyone with the link can edit',
    'Only invited people can view',
    'Only invited people can edit',
  ];

  // Define permission type for TypeScript
  type Permission = 'Full access' | 'Editor' | 'Reader';

  const permissionDescriptions: Record<Permission, string> = {
    'Full access': 'Can edit & share',
    Editor: 'Can edit but not share',
    Reader: 'Cannot edit or share',
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        visibilityDropdownRef.current &&
        !visibilityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsVisibilityDropdownOpen(false);
      }

      if (openPersonDropdownIndex !== null) {
        const ref = peopleDropdownRefs.current[openPersonDropdownIndex];
        if (ref && !ref.contains(event.target as Node)) {
          setOpenPersonDropdownIndex(null);
        }
      }

      if (openTeamDropdownIndex !== null) {
        const ref = teamDropdownRefs.current[openTeamDropdownIndex];
        if (ref && !ref.contains(event.target as Node)) {
          setOpenTeamDropdownIndex(null);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openPersonDropdownIndex, openTeamDropdownIndex]);

  // Hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleCopyLink = async () => {
    try {
      if (!shareUrl) {
        await navigator.clipboard.writeText(shareableLink);
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
      setShowToast(true);
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  };

  const handleCopyEmbedSnippet = () => {
    if (!shareUrl) {
      return;
    }

    navigator.clipboard.writeText(shareUrl + '/embed');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleShare = async () => {
    // Reset error state
    setError(null);

    // Validate email
    if (!inputValue) {
      setError('Please enter an email address');
      return;
    }

    if (!validateEmail(inputValue)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Here you would integrate with your email service to send the invitation
      // This is a placeholder for the actual API call
      const response = await fetch('/api/share/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inputValue,
          itemName,
          permission: selectedPermission,
          shareableLink,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }

      // Add the invited person to the list
      setPeopleWithAccess([
        ...peopleWithAccess,
        {
          name: inputValue, // Using email as name until they accept
          permission: selectedPermission === 'can edit' ? 'Editor' : 'Reader',
        },
      ]);

      // Clear input
      setInputValue('');

      // Show success toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError('Failed to send invitation. Please try again.');
      console.error('Error sending invitation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        onClose={onClose}
        title="Share with people and teams"
        width="w-[600px]"
        actions={
          <div className="flex justify-between items-center w-full">
            {activeTab === 'share' && (
              <>
                <div className="flex justify-between w-full gap-4">
                  {onToggleAccess && (
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => onToggleAccess()}
                    >
                      <div
                        className={`w-8 h-4 rounded-full transition-colors duration-200 ${
                          is_public ? 'bg-brand-solid' : 'bg-tertiary'
                        }`}
                        style={{
                          backgroundColor: is_public
                            ? colors['bg-brand-solid']
                            : colors['bg-tertiary'],
                        }}
                      >
                        <div
                          className={`w-3 h-3 rounded-full bg-white transform transition-transform duration-200 mt-0.5 ${
                            is_public ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors['text-primary'] }}
                      >
                        {is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                  )}
                  <ButtonNormal
                    variant="primary"
                    size="small"
                    leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-02-white.svg`}
                    onClick={handleCopyLink}
                  >
                    Copy Link
                  </ButtonNormal>
                </div>
              </>
            )}
            {activeTab === 'embed' && (
              <ButtonNormal
                variant="primary"
                size="small"
                leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-02-white.svg`}
                onClick={handleCopyEmbedSnippet}
                className="w-full"
              >
                Copy Embed Link
              </ButtonNormal>
            )}
          </div>
        }
      >
        {/* Tabs */}
        <div
          style={{
            backgroundColor: colors['bg-secondary'],
            borderColor: colors['border-secondary'],
          }}
          className="w-full flex items-center gap-1 border rounded-lg p-1 mb-5"
        >
          <button
            onClick={() => setActiveTab('share')}
            style={{
              backgroundColor:
                activeTab === 'share' ? colors['bg-primary'] : 'transparent',
              borderColor:
                activeTab === 'share'
                  ? colors['border-secondary']
                  : 'transparent',
              color:
                activeTab === 'share'
                  ? colors['text-primary']
                  : colors['text-quaternary'],
            }}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 border hover:text-[var(--text-primary)]"
          >
            Share
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            style={{
              backgroundColor:
                activeTab === 'embed' ? colors['bg-primary'] : 'transparent',
              borderColor:
                activeTab === 'embed'
                  ? colors['border-secondary']
                  : 'transparent',
              color:
                activeTab === 'embed'
                  ? colors['text-primary']
                  : colors['text-quaternary'],
            }}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 border hover:text-[var(--text-primary)]"
          >
            Embed
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'share' && (
          <>
            {/* Input field with custom dropdown */}
            <div className="w-full flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <style jsx>{`
                  /* Ensure input text doesn't overlap with the dropdown */
                  :global(input) {
                    padding-right: 140px !important;
                  }
                `}</style>
                {/* <InputField
                  type="default"
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder="Enter teams, people or email address"
                /> */}

                {/* Custom permission dropdown button */}
                {/* <div
                  ref={dropdownRef}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center z-20"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDropdownOpen(!isDropdownOpen);
                    }}
                    className="flex items-center gap-2"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <span
                      className="font-medium"
                      style={{ color: colors['text-tertiary'] }}
                    >
                      {selectedPermission}
                    </span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ color: colors['text-tertiary'] }}
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.6667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 mt-1 top-full w-[180px] rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] py-1 flex flex-col overflow-hidden"
                      style={{
                        backgroundColor: colors['bg-secondary'],
                        border: `1px solid ${colors['border-secondary']}`,
                        zIndex: 50,
                      }}
                    >
                      {permissionOptions.map((option) => (
                        <div
                          key={option}
                          className="self-stretch px-1.5 py-px flex items-center gap-3"
                          onClick={() => {
                            setSelectedPermission(option);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <div
                            className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-between items-center flex cursor-pointer transition-all duration-150"
                            style={{
                              backgroundColor: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                colors['bg-tertiary'];
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                'transparent';
                            }}
                          >
                            <div
                              className="text-sm font-medium"
                              style={{ color: colors['text-primary'] }}
                            >
                              {option}
                            </div>
                            {selectedPermission === option && (
                              <img
                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon3.svg`}
                                alt="Selected"
                                className="w-4 h-4"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div> */}
              </div>
              {/* <ButtonNormal
                variant="primary"
                size="small"
                leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/share-06.svg`}
                onClick={handleShare}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Share'}
              </ButtonNormal> */}
            </div>

            {/* Error message */}
            {error && (
              <div
                className="mb-4 px-3 py-2 rounded-md text-sm"
                style={{
                  backgroundColor: '#FEF3F2',
                  color: '#B42318',
                  border: '1px solid #FEE4E2',
                }}
              >
                {error}
              </div>
            )}

            {/* People with access
            <div className="w-full mb-4">
              <h3
                style={{ color: colors['text-quaternary'] }}
                className="text-sm font-medium mb-3"
              >
                People with access
              </h3>
              <div className="space-y-3">
                {peopleWithAccess.map((person, index) => {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            backgroundColor: colors['bg-accent-muted'],
                            color: colors['text-primary'],
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                        >
                          {person.name.charAt(0)}
                        </div>
                        <span
                          style={{ color: colors['text-secondary'] }}
                          className="text-sm font-medium"
                        >
                          {person.name}
                        </span>
                      </div>
                      <div
                        ref={(el) => {
                          peopleDropdownRefs.current[index] = el;
                        }}
                        className="relative"
                      >
                        <button
                          onClick={() =>
                            setOpenPersonDropdownIndex(
                              index === openPersonDropdownIndex ? null : index
                            )
                          }
                          style={{
                            color: colors['text-primary'],
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors duration-150"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colors['bg-tertiary'];
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              'transparent';
                          }}
                        >
                          {person.permission}
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4 6L8 10L12 6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        {index === openPersonDropdownIndex && (
                          <div
                            className="absolute right-0 mt-1 z-50 w-[180px] rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] py-1 flex flex-col overflow-hidden"
                            style={{
                              backgroundColor: colors['bg-secondary'],
                              border: `1px solid ${colors['border-secondary']}`,
                              zIndex: 50,
                            }}
                          >
                            {personPermissionOptions.map((option) => (
                              <div
                                key={option}
                                className="self-stretch px-1.5 py-px flex items-center"
                                onClick={() => {
                                  const updatedPeople = [...peopleWithAccess];
                                  updatedPeople[index].permission = option;
                                  setPeopleWithAccess(updatedPeople);
                                  setOpenPersonDropdownIndex(null);
                                }}
                              >
                                <div
                                  className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-between items-center flex cursor-pointer transition-all duration-150"
                                  style={{ backgroundColor: 'transparent' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      colors['bg-tertiary'];
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      'transparent';
                                  }}
                                >
                                  <div className="flex flex-col gap-1">
                                    <div
                                      className="text-sm font-medium"
                                      style={{ color: colors['text-primary'] }}
                                    >
                                      {option}
                                    </div>
                                    <div
                                      className="text-xs font-normal"
                                      style={{
                                        color: colors['text-secondary'],
                                      }}
                                    >
                                      {
                                        permissionDescriptions[
                                          option as Permission
                                        ]
                                      }
                                    </div>
                                  </div>
                                  {person.permission === option && (
                                    <img
                                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon3.svg`}
                                      alt="Selected"
                                      className="w-4 h-4"
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            {/* <div
              style={{ backgroundColor: colors['border-secondary'] }}
              className="w-full h-px my-4"
            ></div> */}

            {/* Teams with access */}
            {/* <div className="w-full">
              <h3
                style={{ color: colors['text-quaternary'] }}
                className="text-sm font-medium mb-3"
              >
                Teams with access
              </h3>
              <div className="space-y-3">
                {teamsWithAccess.map((team, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          backgroundColor:
                            team.color === 'blue'
                              ? '#EDF0FB'
                              : team.color === 'indigo'
                                ? '#EEF4FF'
                                : '#FDF2FA',
                          color:
                            team.color === 'blue'
                              ? '#374C99'
                              : team.color === 'indigo'
                                ? '#3538CD'
                                : '#C11574',
                          borderColor:
                            team.color === 'blue'
                              ? '#AEBBED'
                              : team.color === 'indigo'
                                ? '#C7D7FE'
                                : '#FCCEEE',
                        }}
                        className="px-2.5 py-0.5 text-xs font-medium rounded-lg border"
                      >
                        {team.name}
                      </div>
                    </div>
                    <div
                      ref={(el) => {
                        teamDropdownRefs.current[index] = el;
                      }}
                      className="relative"
                    >
                      <button
                        onClick={() =>
                          setOpenTeamDropdownIndex(
                            index === openTeamDropdownIndex ? null : index
                          )
                        }
                        style={{
                          color: colors['text-primary'],
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors duration-150"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            colors['bg-tertiary'];
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {team.permission}
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 6L8 10L12 6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      {index === openTeamDropdownIndex && (
                        <div
                          className="absolute right-0 mt-1 z-50 w-[180px] rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] py-1 flex flex-col overflow-hidden"
                          style={{
                            backgroundColor: colors['bg-secondary'],
                            border: `1px solid ${colors['border-secondary']}`,
                            zIndex: 50,
                          }}
                        >
                          {personPermissionOptions.map((option) => (
                            <div
                              key={option}
                              className="self-stretch px-1.5 py-px flex items-center"
                              onClick={() => {
                                const updatedTeams = [...teamsWithAccess];
                                updatedTeams[index].permission = option;
                                setTeamsWithAccess(updatedTeams);
                                setOpenTeamDropdownIndex(null);
                              }}
                            >
                              <div
                                className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-between items-center flex cursor-pointer transition-all duration-150"
                                style={{ backgroundColor: 'transparent' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors['bg-tertiary'];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    'transparent';
                                }}
                              >
                                <div className="flex flex-col gap-1">
                                  <div
                                    className="text-sm font-medium"
                                    style={{ color: colors['text-primary'] }}
                                  >
                                    {option}
                                  </div>
                                  <div
                                    className="text-xs font-normal"
                                    style={{ color: colors['text-secondary'] }}
                                  >
                                    {
                                      permissionDescriptions[
                                        option as Permission
                                      ]
                                    }
                                  </div>
                                </div>
                                {team.permission === option && (
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon3.svg`}
                                    alt="Selected"
                                    className="w-4 h-4"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </>
        )}

        {activeTab === 'embed' && (
          <div className="w-full">
            <div className="w-full">
              <div
                className="w-full rounded-lg border overflow-hidden"
                style={{
                  backgroundColor: colors['bg-secondary'],
                  borderColor: colors['border-secondary'],
                }}
              >
                <div className="flex flex-col items-center gap-[58px] py-[30px] px-[35px]">
                  {/* Logo and Title */}
                  <div className="flex flex-col items-center gap-[29px]">
                    <div className="flex flex-col items-center gap-[14.5px]">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center relative [&[data-fallback]]:before:content-[attr(data-fallback)] [&[data-fallback]]:before:text-lg [&[data-fallback]]:before:font-medium" style={{ color: colors['text-primary'] }}>
                          <img
                            src={workspaceLogo || `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`}
                            alt="Workspace Logo"
                            className="w-[150px]"
                            onError={(e) => {
                              // If workspace logo fails, try the fallback logo
                              if (workspaceLogo && e.currentTarget.src !== `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`) {
                                e.currentTarget.src = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`;
                              } else {
                                // If fallback also fails, show a text fallback
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.setAttribute('data-fallback', 'ProcessFlow');
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-[14.5px] leading-[1.5] font-medium text-center"
                      style={{ color: colors['text-primary'] }}
                    >
                      This process was created with Processflow. Create your own
                      processes now!
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-center gap-[5.8px]">
                    <div
                      className="flex items-center gap-1 px-3 py-2 rounded-[5.8px] text-white"
                      style={{
                        backgroundColor: '#4E6BD7',
                        boxShadow:
                          '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px -2px 0px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(16, 24, 40, 0.18)',
                      }}
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-right.svg`}
                        alt="Arrow Right"
                      />
                      <span className="text-[14.5px] font-semibold">
                        Show me how
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-2 text-[#475467]">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/refresh-cw-01.svg`}
                        alt="Refresh"
                      />
                      <span className="text-[14.5px] font-semibold">
                        Restart Process
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="flex justify-between items-center px-[17.5px] py-[2.9px] border-t"
                  style={{
                    backgroundColor: colors['bg-tertiary'],
                    borderColor: colors['border-secondary'],
                  }}
                >
                  <div className="flex items-center gap-[8.7px]">
                    <span
                      className="text-[10.2px] leading-[1.43] font-normal"
                      style={{ color: colors['text-secondary'] }}
                    >
                      Made with
                    </span>
                    <img
                      src={workspaceLogo || `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`}
                      alt="Workspace Logo"
                      className="h-[20px]"
                      onError={(e) => {
                        // If workspace logo fails, try the fallback logo
                        if (workspaceLogo && e.currentTarget.src !== `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`) {
                          e.currentTarget.src = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`;
                        } else {
                          // If fallback also fails, show a text fallback
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.setAttribute('data-fallback', 'ProcessFlow');
                        }
                      }}
                    />
                  </div>
                  <button 
                    className="p-2 rounded-[5.8px] hover:bg-[rgba(0,0,0,0.05)]"
                    onClick={() => window.open('https://process-flow.io', '_blank')}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-external-02.svg`}
                      alt="External Link"
                      className="w-[14.5px] h-[14.5px]"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Notification */}
      {showToast && (
        <div
          className="fixed bottom-4 right-4 flex items-center bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg transition-opacity duration-300 z-50"
          style={{
            backgroundColor: colors['bg-accent'],
            color: 'white',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="mr-2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 10L9.16667 11.6667L12.5 8.33333M16.6667 10C16.6667 13.6819 13.6819 16.6667 10 16.6667C6.31811 16.6667 3.33334 13.6819 3.33334 10C3.33334 6.31811 6.31811 3.33334 10 3.33334C13.6819 3.33334 16.6667 6.31811 16.6667 10Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Link copied to clipboard
        </div>
      )}
    </>
  );
}
