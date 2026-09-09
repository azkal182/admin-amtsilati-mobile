import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <ContentSection
      title='Appearance'
      desc='Sesuaikan tema dan font agar nyaman digunakan sepanjang hari.'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
