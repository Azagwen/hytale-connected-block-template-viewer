/**
 * Defines custom connection rules for blocks that connect to adjacent blocks
 */
export type CustomConnectedBlockTemplateAsset = CustomConnectedBlockTemplateAsset1 & CustomConnectedBlockTemplateAsset2
export type CustomConnectedBlockTemplateAsset1 = BaseAsset
export type Direction = "North" | "East" | "South" | "West" | "Up" | "Down"
export type FaceTags = {
    North?: string[]
    East?: string[]
    South?: string[]
    West?: string[]
    Up?: string[]
    Down?: string[]
}

/**
 * Common fields shared by all Hytale asset types
 */
export interface BaseAsset {
  /**
   * Parent asset to inherit from
   */
  Parent?: string
  /**
   * Developer comment
   */
  $Comment?: string
  /**
   * Key-value tag mappings
   */
  Tags?: {
    [k: string]: string[]
  }
  [k: string]: unknown
}
export interface CustomConnectedBlockTemplateAsset2 {
  /**
   * Whether this block connects to blocks of other materials
   */
  ConnectsToOtherMaterials?: boolean
  /**
   * If true, the block shape won't update when neighboring blocks change
   */
  DontUpdateAfterInitialPlacement?: boolean
  /**
   * The default shape to use when no patterns match
   */
  DefaultShape?: string
  /**
   * Map of shape names to their pattern matching rules
   */
  Shapes?: {
    [k: string]: Shape
  }
  [k: string]: unknown
}
/**
 * A shape definition with patterns and face tags
 */
export interface Shape {
  /**
   * Patterns to match - shape is used if any pattern matches
   */
  PatternsToMatchAnyOf?: Pattern[]
  /**
   * Tags for each face when this shape is active
   */
  FaceTags?: FaceTags
}
/**
 * A pattern to match for selecting this shape
 */
export interface Pattern {
  /**
   * The pattern type
   */
  Type?: string
  /**
   * Whether to transform rules based on block orientation
   */
  TransformRulesToOrientation?: boolean
  /**
   * Yaw rotation to apply when replacing block type
   */
  YawToApplyAddReplacedBlockType?:
    | "Zero"
    | "Ninety"
    | "OneEighty"
    | "TwoSeventy"
  /**
   * Whether face tags must match the roll orientation
   */
  RequireFaceTagsMatchingRoll?: boolean
  AllowedPatternTransformations?: AllowedPatternTransformations
  /**
   * Rules that must be satisfied for this pattern to match
   */
  RulesToMatch?: RuleToMatch[]
  /**
   * Only evaluate this pattern when the block is first placed
   */
  OnlyOnPlacement?: boolean
  /**
   * Only evaluate this pattern when neighboring blocks change
   */
  OnlyOnUpdate?: boolean
}
/**
 * Allowed transformations when matching this pattern
 */
export interface AllowedPatternTransformations {
  /**
   * Whether the pattern can be rotated in 90-degree increments
   */
  IsCardinallyRotatable?: boolean
  /**
   * Whether the pattern can be mirrored on the X axis
   */
  MirrorX?: boolean
  /**
   * Whether the pattern can be mirrored on the Z axis
   */
  MirrorZ?: boolean
}
/**
 * A rule for matching neighboring blocks
 */
export interface RuleToMatch {
  /**
   * Relative position of the neighbor to check
   */
  Position?: {
    X: number
    Y: number
    Z: number
  }
  /**
   * Whether matching blocks should be included or excluded
   */
  IncludeOrExclude?: "Include" | "Exclude"
  /**
   * Required placement normal directions
   */
  PlacementNormals?: Direction[]
  /**
   * Block type lists to match against
   */
  BlockTypeLists?: string[]
  /**
   * Specific block types to match
   */
  BlockTypes?: string[]
  /**
   * Shape names to match
   */
  Shapes?: string[]
  /**
   * Face tags the neighbor must have
   */
  FaceTags?: FaceTags
}