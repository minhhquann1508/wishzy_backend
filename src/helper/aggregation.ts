export const useLookup = (
  from: string,
  localField: string,
  as: string,
  foreignField: string = '_id',
) => {
  return {
    $lookup: {
      from,
      localField,
      foreignField,
      as,
    },
  };
};

export const useProjectStage = (fields: string[]) => {
  const projection = fields.reduce(
    (acc, field) => {
      acc[field] = 1;
      return acc;
    },
    {} as Record<string, 1>,
  );

  return {
    $project: projection,
  };
};
