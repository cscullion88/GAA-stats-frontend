"use client"

import { useState, useEffect, useRef } from 'react'
import { Menu, RotateCcw, Save, X } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TeamStats {
  name: string
  goals: number
  points: number
  kickoutWon: number
  kickoutLost: number
  turnoverWon: number
  lostPossession: number
  attacks: number
  shots: number
  wides: number
  secondHalf: boolean
}

interface HalfStats {
  kickoutWon: number
  kickoutLost: number
  turnoverWon: number
  lostPossession: number
  attacks: number
  shots: number
  wides: number
}

interface SavedGame {
  id: string
  team1: TeamStats
  team2: TeamStats
  time: number
  firstHalfStats: HalfStats
  secondHalfStats: HalfStats
}

const TeamInput = ({ index, teamName, handleTeamNameChange, handleClearText }: {
  index: number
  teamName: string
  handleTeamNameChange: (team: 'team1' | 'team2', value: string) => void
  handleClearText: (team: 'team1' | 'team2') => void
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className="relative">
      <Input
        type="text"
        value={teamName}
        onChange={(e) => handleTeamNameChange(index === 0 ? 'team1' : 'team2', e.target.value)}
        ref={inputRef}
        className="text-3xl font-bold mb-4 bg-green-700 border-green-600 text-white placeholder-green-300 pr-10 focus:border-white focus:ring-2 focus:ring-white"
        placeholder="Enter team name"
        maxLength={250}
      />
      {teamName && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          onClick={() => {
            handleClearText(index === 0 ? 'team1' : 'team2')
            inputRef.current?.focus()
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export default function GaelicFootballStats() {
  const [team1, setTeam1] = useState<TeamStats>({ 
    name: 'Team 1', goals: 0, points: 0, kickoutWon: 0, kickoutLost: 0, 
    turnoverWon: 0, lostPossession: 0, attacks: 0, shots: 0, wides: 0, secondHalf: false 
  })
  const [team2, setTeam2] = useState<TeamStats>({ 
    name: 'Team 2', goals: 0, points: 0, kickoutWon: 0, kickoutLost: 0, 
    turnoverWon: 0, lostPossession: 0, attacks: 0, shots: 0, wides: 0, secondHalf: false 
  })
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubtracting, setIsSubtracting] = useState(false)
  const [savedGames, setSavedGames] = useState<SavedGame[]>([])
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [showTotals, setShowTotals] = useState(false)
  const [firstHalfStats, setFirstHalfStats] = useState<HalfStats>({
    kickoutWon: 0, kickoutLost: 0, turnoverWon: 0, lostPossession: 0, attacks: 0, shots: 0, wides: 0
  })
  const [secondHalfStats, setSecondHalfStats] = useState<HalfStats>({
    kickoutWon: 0, kickoutLost: 0, turnoverWon: 0, lostPossession: 0, attacks: 0, shots: 0, wides: 0
  })

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculateTotal = (goals: number, points: number) => goals * 3 + points
  const calculateLeadingBy = () => calculateTotal(team1.goals, team1.points) - calculateTotal(team2.goals, team2.points)

  const handleTeamNameChange = (team: 'team1' | 'team2', value: string) => {
    if (value.length <= 250) {
      if (team === 'team1') {
        setTeam1({ ...team1, name: value })
      } else {
        setTeam2({ ...team2, name: value })
      }
    }
  }

  const handleClearText = (team: 'team1' | 'team2') => {
    if (team === 'team1') {
      setTeam1({ ...team1, name: '' })
    } else {
      setTeam2({ ...team2, name: '' })
    }
  }

  const handleScoreChange = (team: 'team1' | 'team2', type: 'goals' | 'points') => {
    const updateFunc = (prevState: TeamStats) => {
      const newValue = isSubtracting
        ? Math.max(prevState[type] - 1, 0)
        : prevState[type] + 1
      return { ...prevState, [type]: newValue }
    }

    if (team === 'team1') {
      setTeam1(updateFunc)
    } else {
      setTeam2(updateFunc)
    }
  }

  const handleTeam1StatChange = (stat: keyof TeamStats) => {
    setTeam1(prevState => {
      if (stat === 'secondHalf') {
        if (!prevState.secondHalf) {
          // Save first half stats
          setFirstHalfStats({
            kickoutWon: prevState.kickoutWon,
            kickoutLost: prevState.kickoutLost,
            turnoverWon: prevState.turnoverWon,
            lostPossession: prevState.lostPossession,
            attacks: prevState.attacks,
            shots: prevState.shots,
            wides: prevState.wides,
          })
          // Reset stats for second half
          return {
            ...prevState,
            secondHalf: true,
            kickoutWon: 0,
            kickoutLost: 0,
            turnoverWon: 0,
            lostPossession: 0,
            attacks: 0,
            shots: 0,
            wides: 0,
          }
        } else {
          return { ...prevState, secondHalf: false }
        }
      } else if (typeof prevState[stat] === 'number') {
        const newValue = isSubtracting
          ? Math.max((prevState[stat] as number) - 1, 0)
          : (prevState[stat] as number) + 1
        
        // Update second half stats
        if (prevState.secondHalf) {
          setSecondHalfStats(prev => ({
            ...prev,
            [stat]: newValue,
          }))
        }
        
        return { ...prevState, [stat]: newValue }
      }
      return prevState
    })
  }

  const handleReset = () => {
    setTeam1((prevState) => ({ 
      ...prevState, goals: 0, points: 0, kickoutWon: 0, kickoutLost: 0, 
      turnoverWon: 0, lostPossession: 0, attacks: 0, shots: 0, wides: 0, secondHalf: false 
    }))
    setTeam2((prevState) => ({ 
      ...prevState, goals: 0, points: 0, kickoutWon: 0, kickoutLost: 0, 
      turnoverWon: 0, lostPossession: 0, attacks: 0, shots: 0, wides: 0, secondHalf: false 
    }))
    setTime(0)
    setIsRunning(false)
    setIsSubtracting(false)
    setShowTotals(false)
    setFirstHalfStats({
      kickoutWon: 0, kickoutLost: 0, turnoverWon: 0, lostPossession: 0, attacks: 0, shots: 0, wides: 0
    })
    setSecondHalfStats({
      kickoutWon: 0, kickoutLost: 0, turnoverWon: 0, lostPossession: 0, attacks: 0, shots: 0, wides: 0
    })
  }

  const handleStartStop = () => {
    setIsRunning((prevIsRunning) => !prevIsRunning)
  }

  const handleSubtract = () => {
    setIsSubtracting((prev) => !prev)
  }

  const handleSave = () => {
    const newSavedGame: SavedGame = {
      id: Date.now().toString(),
      team1: { ...team1 },
      team2: { ...team2 },
      time: time,
      firstHalfStats: { ...firstHalfStats },
      secondHalfStats: { ...secondHalfStats }
    }
    setSavedGames((prevGames) => [...prevGames, newSavedGame])
  }

  const handleLoad = (game: SavedGame) => {
    setTeam1(game.team1)
    setTeam2(game.team2)
    setTime(game.time)
    setFirstHalfStats(game.firstHalfStats)
    setSecondHalfStats(game.secondHalfStats)
    setIsPanelOpen(false)
  }

  const handleDelete = (id: string) => {
    setSavedGames((prevGames) => prevGames.filter(game => game.id !== id))
  }

  const handleToggleTotals = () => {
    setShowTotals((prev) => !prev)
  }

  return (
    <div className="min-h-screen bg-green-800 text-white font-sans relative">
      <header className="bg-green-900 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Home</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(!isPanelOpen)}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Menu</span>
        </Button>
      </header>
      
      {[team1, team2].map((team, index) => (
        <div key={team.name} className={`p-4 ${index === 0 ? 'border-b border-green-700' : ''}`}>
          <TeamInput
            index={index}
            teamName={team.name}
            handleTeamNameChange={handleTeamNameChange}
            handleClearText={handleClearText}
          />
          <div className="flex justify-between mb-4">
            <Button 
              variant="secondary" 
              className="text-xl px-6 py-2 bg-green-900 text-white"
              onClick={() => handleScoreChange(index === 0 ? 'team1' : 'team2', 'goals')}
            >
              Goal
            </Button>
            <div className="text-4xl font-bold">{team.goals} : {team.points}</div>
            <Button 
              variant="secondary" 
              className="text-xl px-6 py-2 bg-green-900 text-white"
              onClick={() => handleScoreChange(index === 0 ? 'team1' : 'team2', 'points')}
            >
              Point
            </Button>
          </div>
          <div className="text-center text-2xl font-bold mb-4">
            {calculateTotal(team.goals, team.points)} total
          </div>
          {index === 0 && (
            <>
              <div className="text-center text-xl font-bold mb-4">
                {Math.abs(calculateLeadingBy())} {calculateLeadingBy() >= 0 ? 'leading by' : 'trailing by'}
              </div>
              {showTotals && (
                <div className="bg-green-900 p-4 mb-4 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">1st Half</h3>
                  <div className="grid grid-cols-2 gap-2 text-white">
                    <div>Kickout Won: <span className="font-bold">{firstHalfStats.kickoutWon}</span></div>
                    <div>Kickout Lost: <span className="font-bold">{firstHalfStats.kickoutLost}</span></div>
                    <div>Turnover Won: <span className="font-bold">{firstHalfStats.turnoverWon}</span></div>
                    <div>Lost Possession: <span className="font-bold">{firstHalfStats.lostPossession}</span></div>
                    <div>Attacks: <span className="font-bold">{firstHalfStats.attacks}</span></div>
                    <div>Shots: <span className="font-bold">{firstHalfStats.shots}</span></div>
                    <div>Wides: <span className="font-bold">{firstHalfStats.wides}</span></div>
                  </div>
                  <h3 className="text-xl font-bold mt-4 mb-2">2nd Half</h3>
                  <div className="grid grid-cols-2 gap-2 text-white">
                    <div>Kickout Won: <span className="font-bold">{secondHalfStats.kickoutWon}</span></div>
                    <div>Kickout Lost: <span className="font-bold">{secondHalfStats.kickoutLost}</span></div>
                    <div>Turnover Won: <span className="font-bold">{secondHalfStats.turnoverWon}</span></div>
                    <div>Lost Possession: <span className="font-bold">{secondHalfStats.lostPossession}</span></div>
                    <div>Attacks: <span className="font-bold">{secondHalfStats.attacks}</span></div>
                    <div>Shots: <span className="font-bold">{secondHalfStats.shots}</span></div>
                    <div>Wides: <span className="font-bold">{secondHalfStats.wides}</span></div>
                  </div>
                </div>
              )}
              <div className="flex justify-between mb-4">
                <div className="flex flex-col space-y-2">
                  <Button onClick={() => handleTeam1StatChange('kickoutWon')}>Kickout Won: {team.kickoutWon}</Button>
                  <Button onClick={() => handleTeam1StatChange('kickoutLost')}>Kickout Lost: {team.kickoutLost}</Button>
                  <Button onClick={() => handleTeam1StatChange('turnoverWon')}>Turnover Won: {team.turnoverWon}</Button>
                  <Button onClick={() => handleTeam1StatChange('lostPossession')}>Lost Possession: {team.lostPossession}</Button>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button onClick={() => handleTeam1StatChange('attacks')}>Attacks: {team.attacks}</Button>
                  <Button onClick={() => handleTeam1StatChange('shots')}>Shots: {team.shots}</Button>
                  <Button onClick={() => handleTeam1StatChange('wides')}>Wides: {team.wides}</Button>
                  <Button onClick={() => handleTeam1StatChange('secondHalf')} className={team.secondHalf ? 'bg-yellow-500' : ''}>
                    2nd Half: {team.secondHalf ? 'Yes' : 'No'}
                  </Button>
                </div>
              </div>
              <Button 
                variant="secondary" 
                className="w-full bg-green-900 text-white"
                onClick={handleToggleTotals}
              >
                {showTotals ? 'Hide Totals' : 'Show Totals'}
              </Button>
            </>
          )}
        </div>
      ))}
      
      <div className="p-4 flex flex-wrap justify-between items-center gap-2">
        <Button 
          variant="secondary" 
          className={`text-white ${isSubtracting ? 'bg-red-600' : 'bg-green-900'}`}
          onClick={handleSubtract}
        >
          Subtract
        </Button>
        <Button 
          variant="secondary" 
          className={`text-white ${isRunning ? 'bg-red-600' : 'bg-green-900'}`}
          onClick={handleStartStop}
        >
          Start/Stop Clock
        </Button>
        <div className="text-2xl font-bold">{formatTime(time)}</div>
        <Button 
          variant="secondary" 
          className="bg-red-600 text-white"
          onClick={handleReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button 
          variant="secondary" 
          className="bg-blue-600 text-white"
          onClick={handleSave}
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>

      {isPanelOpen && (
        <div className="fixed top-0 right-0 h-full w-64 bg-green-900 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Saved Games</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          {savedGames.map((game) => (
            <div key={game.id} className="flex items-center mb-2">
              <Button
                variant="secondary"
                className="flex-grow text-left mr-2"
                onClick={() => handleLoad(game)}
              >
                {game.team1.name} vs {game.team2.name} - {formatTime(game.time)}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(game.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}