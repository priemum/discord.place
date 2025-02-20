'use client';

import { useEffect, useRef, useState } from 'react';
import cn from '@/lib/cn';
import editProfile from '@/lib/request/profiles/editProfile';
import { toast } from 'sonner';
import Socials from '@/app/(profiles)/profile/[slug]/edit/components/Socials';
import { TbLoader } from 'react-icons/tb';
import { AnimatePresence, motion } from 'framer-motion';
import config from '@/config';
import { useRouter } from 'next-nprogress-bar';
import GenderDropdown from '@/app/(profiles)/profile/[slug]/edit/components/Dropdown/Gender';
import PreferredHostDropdown from '@/app/(profiles)/profile/[slug]/edit/components/Dropdown/PreferredHost';
import Link from 'next/link';
import { PiWarningCircleFill } from 'react-icons/pi';
import revalidateProfile from '@/lib/revalidate/profile';
import { HexAlphaColorPicker  } from 'react-colorful';
import { FaCrown } from 'react-icons/fa';
import Tooltip from '@/app/components/Tooltip';
import CopyButtonCustomTrigger from '@/app/components/CopyButton/CustomTrigger';
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import { t } from '@/stores/language';

extend([a11yPlugin]);

export default function Edit({ profileData }) { 
  const canBeEditedKeys = [
    'slug',
    'occupation',
    'gender',
    'location',
    'birthday',
    'bio',
    'preferredHost'
  ];

  const [unchangedProfile, setUnchangedProfile] = useState(profileData);
  const [profile, setProfile] = useState(profileData);
  const [currentlyEditingIndex, setCurrentlyEditingIndex] = useState(-1);
  const [currentlyEditingValue, setCurrentlyEditingValue] = useState('');
  const [colors, setColors] = useState(profileData.colors || { primary: '#000000', secondary: '#000000' });
  const [changedKeys, setChangedKeys] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (currentlyEditingIndex === -1) return;
    setCurrentlyEditingValue(profile[canBeEditedKeys[currentlyEditingIndex]] || 'Unknown');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentlyEditingIndex]);

  function editKey(key) {
    if (key === 'cardColors') {
      if (colors.primary === (profile.colors?.primary || '#000000') && colors.secondary === (profile.colors?.secondary || '#000000')) return toast.error('You didn\'t make a change.');

      setChangedKeys(oldChangedKeys => ({
        ...oldChangedKeys,
        colors
      }));

      setProfile(oldProfile => ({
        ...oldProfile,
        colors
      }));

      setCurrentlyEditingIndex(-1);

      return;
    }
    
    if (profile[key] === currentlyEditingValue) return toast.error('You didn\'t make a change.');

    setChangedKeys(oldChangedKeys => ({
      ...oldChangedKeys,
      [key === 'slug' ? 'newSlug' : key]: currentlyEditingValue
    }));
    
    setProfile(oldProfile => ({
      ...oldProfile,
      [key]: currentlyEditingValue
    }));
    
    setCurrentlyEditingIndex(-1);
  }

  function saveChangedKeys() {
    setLoading(true);

    toast.promise(editProfile(profileData.slug, changedKeys), {
      loading: 'Updating profile...',
      success: newProfile => {
        setChangedKeys({});
        setProfile(newProfile);
        setUnchangedProfile(newProfile);

        if (Object.keys(changedKeys).includes('newSlug')) {
          setTimeout(() => router.push(config.getProfileURL(changedKeys['newSlug'], newProfile.preferredHost)), 3000);
          return 'Profile updated! You will be redirected to new profile in 3 seconds.';
        } else {
          revalidateProfile(newProfile.slug);
          setLoading(false);
          return 'Profile updated!';
        }
      },
      error: error => {
        setLoading(false);

        return error;
      }
    });
  }

  const bioValueSpanRef = useRef(null);

  function PremiumRequiredBlock() {
    return (
      <div className='flex flex-col w-full p-4 mt-4 border border-yellow-500 rounded-xl bg-yellow-500/10 gap-y-2'>
        <h2 className='flex items-center text-lg font-bold gap-x-2 text-primary'>
          <PiWarningCircleFill /> {t('editProfilePage.premiumRequired.title')}
        </h2>

        <p className='text-sm font-medium text-tertiary'>
          {t('editProfilePage.premiumRequired.description', { link: <Link href='/premium' className='text-secondary hover:text-primary'>{t('editProfilePage.premiumRequired.linkText')}</Link> })}
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col my-8 gap-y-4'>
      <AnimatePresence>
        {Object.keys(changedKeys).length > 0 && (
          <motion.div 
            className='items-center px-8 flex justify-between fixed bottom-4 max-w-[650px] w-full h-[60px] bg-green-800/20 border border-green-700 backdrop-blur-sm rounded-full'
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ 
              duration: 0.25,
              type: 'spring',
              stiffness: 260,
              damping: 20
            }}
          >
            <h1 className='text-lg font-medium text-primary'>
              {t('editProfilePage.unsavedChangesPopover.label')}
            </h1>

            <div className='flex gap-x-2'>
              <button
                className='px-4 py-1.5 text-sm font-semibold rounded-lg disabled:opacity-70 disabled:pointer-events-none text-black dark:text-white hover:text-white dark:hover:text-black hover:bg-black dark:hover:bg-white' onClick={() => {
                  setChangedKeys({});
                  setProfile(unchangedProfile);
                }}
                disabled={loading}
              >
                {t('buttons.cancel')}
              </button>

              <button
                className='flex items-center gap-x-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg disabled:opacity-70 disabled:pointer-events-none text-white dark:text-black dark:bg-white bg-black hover:bg-black/70 dark:hover:bg-white/70 hover:text-white'
                onClick={saveChangedKeys}
                disabled={loading}
              >
                {loading && <TbLoader className='animate-spin' />}
                {t('buttons.save')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className='flex flex-col w-full h-full p-6 rounded-2xl bg-secondary gap-y-8'>
        {canBeEditedKeys.map((key, index) => (
          <div className='flex flex-col justify-between gap-4 sm:flex-row' key={key}>
            <div className='flex flex-col flex-1 w-full gap-y-1 max-w-[80%]'>
              <h2 className='flex items-center font-medium text-tertiary gap-x-2'>
                {t(`editProfilePage.labels.${key}`)}

                {key === 'preferredHost' && (
                  <Tooltip
                    content={t('editProfilePage.tooltip.premiumRequired')}
                    side='right'
                  >
                    <div>
                      <FaCrown className='text-yellow-500' />
                    </div>
                  </Tooltip>
                )}
              </h2>

              {currentlyEditingIndex === index ? (
                key === 'bio' ? (
                  <span
                    autoFocus
                    autoComplete='off'
                    spellCheck='false'
                    disabled={loading}
                    contentEditable
                    suppressContentEditableWarning
                    onKeyUp={() => setCurrentlyEditingValue(bioValueSpanRef?.current?.innerText)}
                    ref={bioValueSpanRef}
                    className='w-full break-all overflow-y-auto max-h-[200px] px-2 py-1 font-medium rounded-md outline-none resize-none disabled:pointer-events-none disabled:opacity-70 text-secondary placeholder-placeholder bg-tertiary hover:bg-quaternary focus-visible:bg-quaternary'
                  >
                    {profileData.bio}
                  </span>
                ) : key === 'gender' ? (
                  <GenderDropdown profile={profile} currentlyEditingValue={currentlyEditingValue} setCurrentlyEditingValue={setCurrentlyEditingValue} />
                ) : key === 'preferredHost' ? (
                  !profile.premium ? (
                    <PremiumRequiredBlock />
                  ) : (
                    <PreferredHostDropdown profile={profile} currentlyEditingValue={currentlyEditingValue} setCurrentlyEditingValue={setCurrentlyEditingValue} />
                  )
                ) : (
                  <input
                    type='text'
                    value={currentlyEditingValue}
                    onChange={event => setCurrentlyEditingValue(event.target.value)}
                    onKeyUp={event => event.key === 'Enter' && editKey(canBeEditedKeys[currentlyEditingIndex])}
                    autoFocus
                    autoComplete='off'
                    spellCheck='false'
                    disabled={loading}
                    className='sm:max-w-[200px] w-full px-2 py-1 font-medium rounded-md outline-none disabled:pointer-events-none disabled:opacity-70 text-secondary placeholder-placeholder bg-tertiary hover:bg-quaternary focus-visible:bg-quaternary'
                  />
                )
              ) : (
                <p className='font-medium whitespace-pre-wrap text-primary max-h-[300px] overflow-y-auto truncate'>{profile[key] || 'Unknown'}</p>
              )}
            </div>

            <div className='flex gap-x-2'>
              {currentlyEditingIndex === index && (
                <button 
                  className='h-max px-4 py-1.5 text-sm font-semibold rounded-lg text-secondary hover:text-primary hover:bg-quaternary disabled:opacity-70 disabled:pointer-events-none'
                  onClick={() => {
                    if (canBeEditedKeys[currentlyEditingIndex] === 'bio') setCurrentlyEditingValue(profile.bio);
                    setCurrentlyEditingIndex(-1);
                  }}
                  disabled={loading}
                >
                  {t('buttons.cancel')}
                </button>
              )}

              <button 
                className={cn(
                  'h-max px-4 py-1.5 text-sm font-semibold rounded-lg disabled:opacity-70 disabled:pointer-events-none',
                  currentlyEditingIndex === index ? 'text-white dark:text-black dark:bg-white bg-black hover:bg-black/70 dark:hover:bg-white/70' : 'text-secondary bg-tertiary hover:text-primary hover:bg-quaternary'
                )} 
                onClick={() => {
                  if (currentlyEditingIndex === index) return editKey(canBeEditedKeys[currentlyEditingIndex]);
                  setCurrentlyEditingIndex(index);
                }}
                disabled={loading}
              >
                {currentlyEditingIndex === index ? t('buttons.save') : t('buttons.edit')}
              </button>
            </div>
          </div>
        ))}

        <div className='flex flex-col justify-between gap-4 sm:flex-row'>
          <div className='flex flex-col flex-1 w-full gap-y-1 max-w-[80%]'>
            <h2 className='flex items-center font-medium text-tertiary gap-x-2'>
              {t('editProfilePage.labels.cardColors')}
              
              <Tooltip
                content={t('editProfilePage.tooltip.premiumRequired')}
                side='right'
              >
                <div>
                  <FaCrown className='text-yellow-500' />
                </div>
              </Tooltip>
            </h2>
            
            {currentlyEditingIndex === 'cardColors' ? (
              profile.premium ? (
                <div className='flex mt-2 gap-x-4'>
                  <div className='flex flex-col gap-y-2'>
                    <h2 className='flex items-center text-sm font-medium text-secondary gap-x-2'>
                      {t('editProfilePage.cardColors.primary')}

                      <div className='w-3 h-3 rounded-full' style={{ backgroundColor: colors.primary || '#000000' }} />
                    </h2>

                    <div className='[&_.react-colorful]:h-[120px] [&_.react-colorful]:w-[120px] [&_.react-colorful\_\_hue]:!h-[10px] [&_.react-colorful\_\_pointer]:w-[10px] [&_.react-colorful\_\_pointer]:h-[10px] [&_.react-colorful\_\_alpha]:h-[10px] [&_.react-colorful\_\_alpha]:w-[120px]'>
                      <HexAlphaColorPicker 
                        color={colors.primary || '#000000'}
                        onChange={color => setColors(oldColors => ({ ...oldColors, primary: color }))}
                      />

                      <input
                        type='text'
                        value={colors.primary || '#000000'}
                        onChange={event => setColors(oldColors => ({ ...oldColors, primary: event.target.value }))}
                        className='w-full px-2 py-1 mt-4 text-sm max-w-[120px] font-medium rounded-md outline-none text-secondary placeholder-placeholder bg-tertiary hover:bg-quaternary focus-visible:bg-quaternary'
                      />
                    </div>
                  </div>

                  <div className='flex flex-col gap-y-2'>
                    <h2 className='flex items-center text-sm font-medium text-secondary gap-x-2'>
                      {t('editProfilePage.cardColors.secondary')}

                      <div className='w-3 h-3 rounded-full' style={{ backgroundColor: colors.secondary || '#000000' }} />
                    </h2>

                    <div className='[&_.react-colorful]:h-[120px] [&_.react-colorful]:w-[120px] [&_.react-colorful\_\_hue]:!h-[10px] [&_.react-colorful\_\_pointer]:w-[10px] [&_.react-colorful\_\_pointer]:h-[10px] [&_.react-colorful\_\_alpha]:h-[10px] [&_.react-colorful\_\_alpha]:w-[120px]'>
                      <HexAlphaColorPicker 
                        color={colors.secondary || '#000000'}
                        onChange={color => setColors(oldColors => ({ ...oldColors, secondary: color }))}
                      />

                      <input
                        type='text'
                        value={colors.secondary || '#000000'}
                        onChange={event => setColors(oldColors => ({ ...oldColors, secondary: event.target.value }))}
                        className='w-full px-2 py-1 mt-4 text-sm max-w-[120px] font-medium rounded-md outline-none text-secondary placeholder-placeholder bg-tertiary hover:bg-quaternary focus-visible:bg-quaternary'
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <PremiumRequiredBlock />
              )
            ) : (
              <div className='flex mt-2 gap-x-4'>
                <div className='flex flex-col gap-y-2'>
                  <h2 className='text-sm font-medium text-secondary'>
                    {t('editProfilePage.cardColors.primary')}                    
                  </h2>

                  <CopyButtonCustomTrigger
                    timeout={2000}
                    successText={t('editProfilePage.toast.colorCopied', { hex: profile.colors?.primary || '#000000' })}
                    copyText={profile.colors?.primary || '#000000'}
                  >
                    <div className='relative flex items-center justify-center w-20 h-12 cursor-pointer group'>
                      <div
                        style={{ backgroundColor: profile.colors?.primary || '#000000' }}
                        className='w-full h-full rounded-lg'
                      />

                      <div
                        className={cn(
                          'absolute flex items-center justify-center text-xs font-semibold max-w-[50px] text-center transition-opacity duration-200 opacity-0 gap-x-2 group-hover:opacity-100',
                          colord(profile.colors?.primary || '#000000').isLight() ? 'text-black' : 'text-white'
                        )}
                      >
                        {t('editProfilePage.cardColors.copyColor', { hex: profile.colors?.primary || '#000000' })}
                      </div>
                    </div>
                  </CopyButtonCustomTrigger>
                </div>

                <div className='flex flex-col gap-y-2'>
                  <h2 className='text-sm font-medium text-secondary'>
                    {t('editProfilePage.cardColors.secondary')}
                  </h2>

                  <CopyButtonCustomTrigger
                    timeout={2000}
                    successText={t('editProfilePage.toast.colorCopied', { hex: profile.colors?.secondary || '#000000' })}
                    copyText={profile.colors?.secondary || '#000000'}
                  >
                    <div className='relative flex items-center justify-center w-20 h-12 cursor-pointer group'>
                      <div
                        style={{ backgroundColor: profile.colors?.secondary || '#000000' }}
                        className='w-full h-full rounded-lg'
                      />

                      <div
                        className={cn(
                          'absolute flex items-center justify-center text-xs font-semibold max-w-[50px] text-center transition-opacity duration-200 opacity-0 gap-x-2 group-hover:opacity-100',
                          colord(profile.colors?.secondary || '#000000').isLight() ? 'text-black' : 'text-white'
                        )}
                      >
                        {t('editProfilePage.cardColors.copyColor', { hex: profile.colors?.secondary || '#000000' })}
                      </div>
                    </div>
                  </CopyButtonCustomTrigger>
                </div>
              </div>
            )}
          </div>

          <div className='flex gap-x-2'>
            {currentlyEditingIndex === 'cardColors' && (
              <>
                <button 
                  className='h-max px-4 py-1.5 text-sm font-semibold rounded-lg text-secondary hover:text-primary hover:bg-quaternary disabled:opacity-70 disabled:pointer-events-none'
                  onClick={() => setCurrentlyEditingIndex(-1)}
                  disabled={loading}
                >
                  {t('buttons.cancel')}
                </button>

                <button 
                  className='h-max px-4 py-1.5 flex items-center gap-x-1.5 text-sm font-semibold rounded-lg text-secondary hover:text-primary hover:bg-quaternary disabled:opacity-70 disabled:pointer-events-none'
                  onClick={() => {
                    setLoading(true);

                    toast.promise(editProfile(profileData.slug, { colors: { primary: null, secondary: null } }), {
                      loading: t('editProfilePage.toast.resettingColors'),
                      success: newProfile => {
                        setLoading(false);

                        setProfile(oldProfile => ({
                          ...oldProfile,
                          colors: newProfile.colors
                        }));

                        setColors(oldColors => ({
                          ...oldColors,
                          secondary: newProfile.colors?.secondary || '#000000',
                          primary: newProfile.colors?.primary || '#000000'
                        }));

                        return t('editProfilePage.toast.colorsReset');
                      },
                      error: error => {
                        setLoading(false);

                        return error;
                      }
                    });
                  }}
                  disabled={loading}
                >
                  {loading && <TbLoader className='animate-spin' />}
                  {t('buttons.reset')}
                </button>
              </>
            )}

            <button 
              className={cn(
                'h-max px-4 py-1.5 text-sm font-semibold rounded-lg disabled:opacity-70 disabled:pointer-events-none',
                currentlyEditingIndex === 'cardColors' ? 'text-white dark:text-black dark:bg-white bg-black hover:bg-black/70 dark:hover:bg-white/70' : 'text-secondary bg-tertiary hover:text-primary hover:bg-quaternary'
              )} 
              onClick={() => {
                if (currentlyEditingIndex === 'cardColors') return editKey('cardColors');
                setCurrentlyEditingIndex('cardColors');
              }}
              disabled={loading}
            >
              {currentlyEditingIndex === 'cardColors' ? t('buttons.save') : t('buttons.edit')}
            </button>
          </div>
        </div>
      </div>

      <Socials profile={profile} />
    </div>
  );
}
