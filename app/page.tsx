import Header from './components/Header'
import AITaskGenerator from './components/AITaskGenerator'
import SkillList from './components/skill/SkillList'
import TokenDisplay from './components/TokenDisplay'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <TokenDisplay />
        <AITaskGenerator />
        <SkillList />
      </main>
    </div>
  )
}