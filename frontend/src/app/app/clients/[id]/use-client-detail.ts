"use client"

import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { readClientOptions, setKeyContactMutation, deleteClientContactMutation } from "@/client/@tanstack/react-query.gen"
import { toast } from "sonner"

const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const MS_PER_DAY = MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY

export function useClientQueries(clientId: number) {
  const { data: client, isLoading, error } = useQuery({
    ...readClientOptions({ path: { client_id: clientId } }),
  })
  return { client, isLoading, error }
}

export function useClientMutations(clientId: number) {
  const queryClient = useQueryClient()
  const queryKey = readClientOptions({ path: { client_id: clientId } }).queryKey

  const { mutate: setKeyContact } = useMutation({
    ...setKeyContactMutation(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); toast.success("Key contact updated") },
    onError: () => { toast.error("Failed to update key contact") },
  })

  const { mutate: deleteContact } = useMutation({
    ...deleteClientContactMutation(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); toast.success("Contact removed") },
    onError: () => { toast.error("Failed to remove contact") },
  })

  const handleSetKeyContact = (contactId: number) => {
    setKeyContact({ path: { client_id: clientId, contact_id: contactId } })
  }

  const handleDeleteContact = (contactId: number) => {
    if (confirm("Are you sure you want to remove this contact?")) {
      deleteContact({ path: { client_id: clientId, contact_id: contactId } })
    }
  }

  return { handleSetKeyContact, handleDeleteContact }
}

interface JobLike { status?: string | null }
interface ContactLike { id: number; name?: string; email?: string | null }

export function useClientComputedData(options: {
  jobs: JobLike[] | undefined
  contacts: ContactLike[] | undefined
  keyContactId: number | null | undefined
  createdAt: string | undefined
}) {
  const jobStats = useMemo(() => {
    if (!options.jobs) return { total: 0, active: 0, completed: 0, planned: 0 }
    return {
      total: options.jobs.length,
      active: options.jobs.filter(j => j.status === "active").length,
      completed: options.jobs.filter(j => j.status === "completed").length,
      planned: options.jobs.filter(j => j.status === "planned").length,
    }
  }, [options.jobs])

  const keyContact = useMemo(() => {
    if (!options.contacts) return null
    if (options.keyContactId) return options.contacts.find(c => c.id === options.keyContactId) || null
    return options.contacts.find(c => c.email) || options.contacts[0] || null
  }, [options.contacts, options.keyContactId])

  const clientAgeDays = useMemo(() => {
    if (!options.createdAt) return 0
    return Math.floor((new Date().getTime() - new Date(options.createdAt).getTime()) / MS_PER_DAY)
  }, [options.createdAt])

  return { jobStats, keyContact, clientAgeDays }
}
