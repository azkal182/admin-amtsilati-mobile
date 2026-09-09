import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <ContentSection
      title='Profile'
      desc='Identitas administrator dan hak akses efektif pada sesi ini.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
