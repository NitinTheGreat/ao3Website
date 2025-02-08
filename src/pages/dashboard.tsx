"use client"
import React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search } from "lucide-react"
import axios from "axios"
import Sidebar  from "../../components/Sidebar/Sidebar"
interface Recommendations {
  [key: string]: string[]
}

interface CacheItem<T> {
  data: T
  timestamp: number
}

const CACHE_DURATION = 50 * 1000

function useCachedFetch<T>(url: string, accessToken: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) {
        setError("No access token found")
        setIsLoading(false)
        return
      }

      const cachedItem = localStorage.getItem(url)
      if (cachedItem) {
        const { data: cachedData, timestamp }: CacheItem<T> = JSON.parse(cachedItem)
        if (Date.now() - timestamp < CACHE_DURATION) {
          setData(cachedData)
          setIsLoading(false)
          return
        }
      }

      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (response.status !== 200) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const fetchedData = response.data
        setData(fetchedData)
        localStorage.setItem(
          url,
          JSON.stringify({
            data: fetchedData,
            timestamp: Date.now(),
          }),
        )
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [url, accessToken])

  return { data, isLoading, error }
}

const SkeletonTag = () => (
  <motion.div
    className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  />
)

const SkeletonCard = () => (
  <motion.div
    className="animate-pulse bg-white p-4 rounded-lg shadow"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-3 bg-gray-200 rounded w-full"></div>
      ))}
    </div>
  </motion.div>
)

// const Sidebar = () => {
//   return <aside className="bg-gray-100 w-64 h-screen fixed">{/* Add your sidebar content here */}</aside>
// }

function RecommendationsPage() {
  const [allTags, setAllTags] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Recommendations>({})
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendations>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [selectedFandom, setSelectedFandom] = useState("")

  const accessToken = localStorage.getItem("accessToken")
  const { data, isLoading, error } = useCachedFetch<Recommendations>(
    "https://ao3-aiml.onrender.com/recommendations/Dipit12",
    accessToken,
  )

  useEffect(() => {
    if (data) {
      const tags = Object.keys(data)
      setAllTags(tags)
      setRecommendations(data)
      setFilteredRecommendations(data)
    }
  }, [data])

  useEffect(() => {
    if (!isLoading && !error) {
      let filtered = { ...recommendations }

      if (selectedTag) {
        filtered = Object.fromEntries(Object.entries(filtered).filter(([tag]) => tag === selectedTag))
      }

      if (selectedFandom) {
        filtered = Object.fromEntries(
          Object.entries(filtered).map(([tag, links]) => [
            tag,
            links.filter((link) => link.toLowerCase().includes(selectedFandom.toLowerCase())),
          ]),
        )
      }

      if (searchTerm) {
        filtered = Object.fromEntries(
          Object.entries(filtered).map(([tag, links]) => [
            tag,
            links.filter(
              (link) =>
                link.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tag.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
          ]),
        )
      }

      // Filter out empty arrays
      filtered = Object.fromEntries(Object.entries(filtered).filter(([_, links]) => links.length > 0))

      setFilteredRecommendations(filtered)
    }
  }, [selectedTag, selectedFandom, searchTerm, recommendations, isLoading, error])

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag === selectedTag ? "" : tag)
  }

  const handleFandomClick = (fandom: string) => {
    setSelectedFandom(fandom === selectedFandom ? "" : fandom)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex mb-28 md:mb-0">
      <Sidebar />
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="m-8 lg:ml-24 w-full">
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900 mb-4 md:mb-0">Recommendations</h1>
          <div className="w-full md:w-auto md:ml-4 relative">
            <input
              type="text"
              placeholder="Search Tags or Titles"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96 px-4 py-2 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Tags</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {isLoading
                  ? [...Array(6)].map((_, index) => <SkeletonTag key={index} />)
                  : allTags.map((tag) => (
                      <motion.button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedTag === tag ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {tag}
                      </motion.button>
                    ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {isLoading
                ? [...Array(3)].map((_, index) => <SkeletonCard key={index} />)
                : Object.entries(filteredRecommendations).map(([tag, links]) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white p-4 rounded-lg shadow"
                    >
                      <div className="text-sm font-medium text-gray-900 mb-2">{tag} :</div>
                      <div className="space-y-1">
                        {links.map((link, index) => (
                          <div key={index} className="flex items-start">
                            <span className="mr-2">›</span>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline block"
                            >
                              {link}
                            </a>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default RecommendationsPage

