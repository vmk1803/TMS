export enum StorageTemperatureEnum {
  ROOM_TEMPERATURE = 'ROOM TEMPERATURE',
  FROZEN = 'FROZEN',
  REFRIGERATED = 'REFRIGERATED',
  IMAGE = 'IMAGE',
}

export interface NewTestTubeForm {
  tubeName: string
  specialInstructions?: string
  quantity?: string
  storageTemperature?: StorageTemperatureEnum | ''
  imageFile?: File | null
}

export interface SaveTestTubeResponse {
  status: number
  message?: string
  data?: any
}

export interface TubeDTO {
  tube_guid?: string
  quantity: string | number | null
  image_url?: string | null
  tube_name: string
  storage_temperature?: string | null
  special_instructions?: string | null
  is_deleted?: boolean | null
}

export interface GetAllTubesResponse {
  status: number
  message?: string
  page?: number
  limit?: number
  total_count?: number
  data?: TubeDTO[]
}

export interface GetAllTubesResult {
  data: TubeDTO[]
  page: number
  limit: number
  total_count: number
}

export interface GetTubeByGuidResponse {
  status: number
  message?: string
  data?: TubeDTO | null
}
